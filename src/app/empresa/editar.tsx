import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useTheme } from '@/hooks/use-theme';

import { GalleryGrid, HeaderSaveButton, LogoCard, TagListField } from '@/components/company/company-edit-sections';
import {
  DiscardButton,
  EditTopBar,
  FormField,
  FormSection,
  SaveButton,
  SelectField,
} from '@/components/profile/profile-form';
import { StatusPill } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import { showAlert } from '@/components/ui/app-alert';
import { Spacing } from '@/constants/theme';
import { fetchCompany } from '@/utils/api';
import {
  addCompanyGalleryPhoto,
  removeCompanyGalleryPhoto,
  rfcServerError,
  updateCompany,
  uploadCompanyLogo,
  type CompanyMemberView,
  type GalleryPhoto,
  type UpdateCompanyInput,
} from '@/utils/company-api';

/** Mismos límites que el PATCH y los endpoints de media del backend. */
const MAX_ITEMS = 10;
const MAX_FOTOS = 5;
const MAX_QUE_HACEMOS = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAIS_OPTIONS = [{ label: 'México', value: 'MX' }];

type EditarEmpresaForm = {
  name: string;
  rfc: string;
  industry: string;
  pais: 'MX';
  direccionComercial: string;
  telefono: string;
  correo: string;
  queHacemos: string;
  ofrecemos: string[];
  buscamos: string[];
};

/** Opcionales que el backend vacía con null (un string vacío no pasa la validación de correo). */
const NULLABLE = new Set<keyof EditarEmpresaForm>(['direccionComercial', 'telefono', 'correo', 'queHacemos']);

function toForm(c: CompanyMemberView): EditarEmpresaForm {
  return {
    name: c.name,
    rfc: c.rfc,
    industry: c.industry,
    pais: c.pais ?? 'MX',
    direccionComercial: c.direccionComercial ?? '',
    telefono: c.telefono ?? '',
    correo: c.correo ?? '',
    queHacemos: c.queHacemos ?? '',
    ofrecemos: c.ofrecemos ?? [],
    buscamos: c.buscamos ?? [],
  };
}

/** El PATCH solo con lo que cambió respecto de lo último guardado; los opcionales vacíos van como null. */
function buildPatch(original: EditarEmpresaForm, form: EditarEmpresaForm): UpdateCompanyInput {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(form) as (keyof EditarEmpresaForm)[]) {
    const raw = form[key];
    const value = typeof raw === 'string' ? raw.trim() : raw;
    if (JSON.stringify(value) === JSON.stringify(original[key])) continue;
    patch[key] = value === '' && NULLABLE.has(key) ? null : value;
  }
  return patch;
}

function SectionIcon({ name }: { name: SymbolViewProps['name'] }) {
  const theme = useTheme();
  return <SymbolView name={name} tintColor={theme.accent} size={16} />;
}

export default function EditarEmpresaScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { reload: reloadCompanies } = useActiveCompany();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const scrollRef = useRef<ScrollView>(null);

  const [company, setCompany] = useState<CompanyMemberView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notAdmin, setNotAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<EditarEmpresaForm>();
  const queHacemos = useWatch({ control, name: 'queHacemos' }) ?? '';
  const ofrecemos = useWatch({ control, name: 'ofrecemos' }) ?? [];
  const buscamos = useWatch({ control, name: 'buscamos' }) ?? [];
  const allowExit = useDiscardGuard(isDirty, { title: '¿Descartar modificaciones?' });

  const requireToken = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error('No se pudo obtener la sesión.');
    return token;
  }, [getToken]);

  const load = useCallback(() => {
    requireToken()
      .then((token) => fetchCompany(companyId, token))
      .then((c) => {
        // El backend igual responde 403 al PATCH si no es admin; acá se evita mostrar un form inútil.
        if (!c.esMiembro || c.rol !== 'ADMINISTRADOR') {
          setNotAdmin(true);
          return;
        }
        const member = c as CompanyMemberView;
        setCompany(member);
        reset(toForm(member));
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [companyId, requireToken, reset]);

  useEffect(load, [load]);

  // Todos los campos validables están arriba (Datos Principales): si algo falla, volver para verlo.
  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  async function onSubmit(form: EditarEmpresaForm) {
    if (!company) return;
    const patch = buildPatch(toForm(company), form);
    if (Object.keys(patch).length === 0) {
      allowExit();
      router.back();
      return;
    }
    setSaving(true);
    try {
      await updateCompany(company.id, patch, await requireToken());
      reloadCompanies();
      allowExit();
      router.back();
    } catch (e) {
      const rfcError = rfcServerError(e);
      if (rfcError) {
        setError('rfc', { message: rfcError });
        scrollToTop();
        AccessibilityInfo.announceForAccessibility(rfcError);
      } else {
        showAlert('No se pudieron guardar los cambios', (e as Error).message);
      }
    } finally {
      setSaving(false);
    }
  }
  const save = () => handleSubmit(onSubmit, scrollToTop)();

  /** Logo y galería se suben al momento (endpoints propios): no pasan por el PATCH ni por el guard. */
  async function pickImage(aspect?: [number, number]) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: !!aspect,
      aspect,
      quality: 0.8,
    });
    return result.canceled ? null : result.assets[0];
  }

  async function uploadLogo() {
    if (!company) return;
    const asset = await pickImage([1, 1]);
    if (!asset) return;
    setUploadingLogo(true);
    try {
      const { logoUrl } = await uploadCompanyLogo(company.id, asset, await requireToken());
      setCompany((c) => c && { ...c, logoUrl });
      reloadCompanies();
    } catch (e) {
      showAlert('No se pudo subir el logotipo', (e as Error).message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function addFoto() {
    if (!company) return;
    const asset = await pickImage();
    if (!asset) return;
    setUploadingFoto(true);
    try {
      const { galeria } = await addCompanyGalleryPhoto(company.id, asset, await requireToken());
      setCompany((c) => c && { ...c, galeria });
    } catch (e) {
      showAlert('No se pudo subir la foto', (e as Error).message);
    } finally {
      setUploadingFoto(false);
    }
  }

  function removeFoto(foto: GalleryPhoto) {
    if (!company) return;
    showAlert('¿Eliminar la foto?', 'Se quita de la galería de la empresa.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          requireToken()
            .then((token) => removeCompanyGalleryPhoto(company.id, foto.id, token))
            .then(({ galeria }) => setCompany((c) => c && { ...c, galeria }))
            .catch((e: Error) => showAlert('No se pudo eliminar la foto', e.message));
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceInset }]}>
      <EditTopBar
        title="Editar Empresa"
        subtitle={company?.name}
        onBack={() => router.back()}
        action={company && <HeaderSaveButton onPress={save} disabled={!isDirty} loading={saving} />}
      />

      {notAdmin ? (
        <View style={styles.center}>
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>
            Solo el administrador de la empresa puede editarla.
          </ThemedText>
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{loadError}</ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLoadError(null);
              load();
            }}
            style={styles.retry}>
            <ThemedText type="smallBold" style={{ color: theme.accentText }}>
              Reintentar
            </ThemedText>
          </Pressable>
        </View>
      ) : !company ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : (
        <>
          <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <LogoCard logoUrl={company.logoUrl} uploading={uploadingLogo} onUpload={uploadLogo} />

            <FormSection
              squareIcon
              icon={<SectionIcon name={{ ios: 'building.2', android: 'business', web: 'business' }} />}
              title="Datos Principales y Fiscales"
              subtitle="Datos legales y de contacto de la empresa">
              <Controller
                control={control}
                name="name"
                rules={{ validate: (v) => v.trim() !== '' || 'Requerido' }}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Razón Social / Nombre Comercial"
                    required
                    maxLength={120}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="rfc"
                rules={{ validate: (v) => v.trim() !== '' || 'Requerido' }}
                render={({ field, fieldState }) =>
                  company.verified ? (
                    <FormField
                      label="Identificador Fiscal (RFC)"
                      value={field.value}
                      editable={false}
                      badge={<StatusPill label="Validado SAT" variant="success" icon="verified" />}
                    />
                  ) : (
                    <FormField
                      label="Identificador Fiscal (RFC)"
                      required
                      autoCapitalize="characters"
                      autoCorrect={false}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )
                }
              />
              <Controller
                control={control}
                name="industry"
                rules={{ validate: (v) => v.trim() !== '' || 'Requerido' }}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Rubro"
                    required
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="direccionComercial"
                render={({ field }) => (
                  <FormField
                    label="Dirección Comercial"
                    maxLength={200}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="pais"
                render={({ field }) => (
                  <SelectField label="País Sede" options={PAIS_OPTIONS} value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="telefono"
                render={({ field }) => (
                  <FormField
                    label="Teléfono de Contacto Directo"
                    icon="phone"
                    keyboardType="phone-pad"
                    maxLength={30}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="correo"
                rules={{ validate: (v) => v.trim() === '' || EMAIL.test(v.trim()) || 'Correo no válido' }}
                render={({ field, fieldState }) => (
                  <FormField
                    label="Correo Electrónico Corporativo"
                    icon="at"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </FormSection>

            <FormSection
              squareIcon
              icon={<SectionIcon name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }} />}
              title="¿Qué hacemos?"
              subtitle="Resume tu propuesta de valor y visión tecnológica para partners y clientes."
              action={
                <ThemedText style={[styles.counter, { color: theme.textMuted }]}>
                  {queHacemos.length} / {MAX_QUE_HACEMOS}
                </ThemedText>
              }>
              <Controller
                control={control}
                name="queHacemos"
                render={({ field }) => (
                  <FormField
                    accessibilityLabel="¿Qué hacemos?"
                    multiline
                    maxLength={MAX_QUE_HACEMOS}
                    placeholder="Describe a qué se dedica tu empresa"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormSection>

            <FormSection
              squareIcon
              icon={<SectionIcon name={{ ios: 'briefcase', android: 'work', web: 'work' }} />}
              title="¿Qué ofrecemos?"
              subtitle="Capacidades de provisión de la empresa"
              action={<StatusPill label={`${ofrecemos.length} / ${MAX_ITEMS} activos`} variant="success" />}>
              <Controller
                control={control}
                name="ofrecemos"
                render={({ field }) => (
                  <TagListField
                    items={field.value}
                    onChange={field.onChange}
                    max={MAX_ITEMS}
                    addLabel="Añadir servicio / oferta"
                    colors={{ bg: theme.accentSoft, border: theme.border, fg: theme.accentText }}
                  />
                )}
              />
            </FormSection>

            <FormSection
              squareIcon
              icon={<SectionIcon name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} />}
              title="¿Qué buscamos?"
              subtitle="Requerimientos y adquisiciones de negocio"
              action={<StatusPill label={`${buscamos.length} / ${MAX_ITEMS} requeridos`} variant="accent" />}>
              <Controller
                control={control}
                name="buscamos"
                render={({ field }) => (
                  <TagListField
                    items={field.value}
                    onChange={field.onChange}
                    max={MAX_ITEMS}
                    addLabel="Añadir requerimiento"
                    colors={{ bg: theme.warningSurface, border: theme.warningBorder, fg: theme.warningText }}
                  />
                )}
              />
            </FormSection>

            <FormSection
              squareIcon
              icon={<SectionIcon name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }} />}
              title="Galería de Referencia"
              subtitle="Instalaciones, productos y casos de éxito"
              action={<StatusPill label={`${company.galeria.length} de ${MAX_FOTOS} fotos cargadas`} />}>
              <GalleryGrid
                fotos={company.galeria}
                max={MAX_FOTOS}
                uploading={uploadingFoto}
                onAdd={addFoto}
                onRemove={removeFoto}
              />
            </FormSection>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.surfaceBorder }]}>
            <View style={styles.cancel}>
              <DiscardButton outlined label="Cancelar" onPress={() => router.back()} />
            </View>
            <View style={styles.submit}>
              <SaveButton label="Guardar Modificaciones" onPress={save} disabled={!isDirty} loading={saving} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  retry: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Sin inset inferior propio: la BottomTabBar global (root _layout.tsx) ya lo pone debajo.
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    borderTopWidth: 1,
  },
  cancel: {
    flex: 1,
  },
  submit: {
    flex: 2,
  },
});
