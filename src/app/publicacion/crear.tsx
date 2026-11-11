import { useAuth } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useController, useForm, type Control } from 'react-hook-form';

import { POST_TYPE_CHIPS, type PostTypeChip } from '@/components/post/post-data';
import { useCompanyBlocked } from '@/components/post/use-company-blocked';
import { useRubrosCatalog } from '@/components/post/use-rubros-catalog';
import { PrimaryButton } from '@/components/register/primary-button';
import { showAlert } from '@/components/ui/app-alert';
import { FormInput } from '@/components/ui/form-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createPost, fetchPostQuota, uploadPostMedia, type AdjuntoView, type PostQuotaView, type Rubro } from '@/utils/api';

const MAX_PHOTOS = 3;

/** Foto local en el picker: `key` es `null` mientras se sube a `POST /posts/media`. */
type PendingPhoto = { uri: string; key: string | null };

type CreatePostForm = {
  title: string;
  description: string;
};

/** RN-PUB-03: saldo por tipo, siempre contra el backend — sin valor fijo en el componente. */
function useQuota(companyId: string) {
  const { getToken } = useAuth();
  const [quota, setQuota] = useState<PostQuotaView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchPostQuota(companyId, token);
      })
      .then((next) => {
        setQuota(next);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [companyId, getToken]);

  useEffect(load, [load]);

  return { quota, error, reload: load };
}

function QuotaBadge({ chip, quota, error, onRetry }: { chip: PostTypeChip; quota: PostQuotaView | null; error: string | null; onRetry: () => void }) {
  const theme = useTheme();

  if (error) {
    return (
      <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar cargar saldo" style={[styles.quotaBadge, { borderColor: theme.error }]}>
        <ThemedText type="small" style={{ color: theme.error }}>
          {error} Tocá para reintentar.
        </ThemedText>
      </Pressable>
    );
  }
  if (!quota) {
    return <ActivityIndicator color={theme.accent} style={{ marginBottom: Spacing.three }} />;
  }

  const { permitida, saldo, limite, motivo } = quota.cupos[chip.tipo];
  const exhausted = !permitida || saldo <= 0;
  const low = !exhausted && saldo <= 1;
  // ponytail: el theme no tiene fondos "soft" para warning/error — se mantiene accentSoft como
  // base y solo se cambia borde y texto, igual que el resto de badges de estado del repo.
  const stateColor = exhausted ? theme.error : low ? theme.warning : theme.accent;

  return (
    <View style={[styles.quotaBadge, { backgroundColor: theme.accentSoft, borderColor: stateColor }]}>
      <ThemedText type="small" style={{ color: stateColor, fontWeight: '700' }}>
        {exhausted
          ? motivo ?? `Sin cupo disponible este mes para publicaciones de tipo ${chip.label}.`
          : `Te quedan ${saldo} de ${limite} publicaciones de este tipo este mes.`}
      </ThemedText>
    </View>
  );
}

function TypeSelector({ selected, onSelect }: { selected: PostTypeChip; onSelect: (chip: PostTypeChip) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.chipsRow}>
      {POST_TYPE_CHIPS.map((chip) => {
        const active = chip.key === selected.key;
        return (
          <Pressable
            key={chip.key}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={chip.label}
            onPress={() => onSelect(chip)}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.accentSoft : theme.surfaceInset, borderColor: active ? theme.accent : theme.surfaceBorder },
            ]}>
            {active && <SymbolView tintColor={theme.accent} name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} />}
            <ThemedText type="small" style={{ color: active ? theme.accent : theme.textMuted }}>
              {chip.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function IndustrySelector({
  control,
  rubros,
  error,
  onRetry,
  saldoDisponible,
}: {
  control: Control<CreatePostForm & { industries: string[] }>;
  rubros: Rubro[] | null;
  error: string | null;
  onRetry: () => void;
  /** Saldo del tipo seleccionado (RN-PUB-01: cada rubro consume 1 cupo propio). `null` = desconocido. */
  saldoDisponible: number | null;
}) {
  const theme = useTheme();
  // ponytail: industries isn't part of CreatePostForm's typed fields — cast locally instead of
  // widening the whole form type, since this is the only field that needs it.
  const { field } = useController({ control: control as unknown as Control<{ industries: string[] }>, name: 'industries' });
  const selected: string[] = field.value ?? [];

  // UX preventiva simple: no deja agregar más rubros de los que alcanza el saldo total. La
  // validación dura (duplicados, códigos inválidos) la hace el servidor con 400/409 real.
  const atSaldoLimit = saldoDisponible !== null && selected.length >= saldoDisponible;

  function toggle(codigo: string) {
    if (selected.includes(codigo)) {
      field.onChange(selected.filter((c) => c !== codigo));
      return;
    }
    if (atSaldoLimit) {
      showAlert('Sin saldo para más rubros', 'Cada rubro adicional consume 1 cupo de este tipo este mes — no te queda saldo para agregar otro.');
      return;
    }
    field.onChange([...selected, codigo]);
  }

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">Rubro o Sector Industrial*</ThemedText>
      <ThemedText type="small" style={{ color: theme.textMuted }}>
        Cada rubro adicional consume 1 cupo de publicaciones de este tipo este mes.
      </ThemedText>

      {error && (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar cargar rubros">
          <ThemedText type="small" style={{ color: theme.error }}>
            {error} Tocá para reintentar.
          </ThemedText>
        </Pressable>
      )}
      {!rubros && !error && <ActivityIndicator color={theme.accent} />}

      <View style={styles.chipsRow}>
        {rubros?.map((rubro) => {
          const active = selected.includes(rubro.codigo);
          return (
            <Pressable
              key={rubro.codigo}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={rubro.nombre}
              onPress={() => toggle(rubro.codigo)}
              style={[
                styles.chip,
                { backgroundColor: active ? theme.accent : theme.surfaceInset, borderColor: active ? theme.accent : theme.surfaceBorder },
              ]}>
              <ThemedText type="small" style={{ color: active ? theme.screenBackground : theme.textMuted }}>
                {rubro.nombre}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PhotoPicker({
  photos,
  onChange,
  companyId,
}: {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
  companyId: string;
}) {
  const theme = useTheme();
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function addPhoto() {
    if (photos.length >= MAX_PHOTOS || uploading) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir imágenes a la publicación.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;

    const asset = result.assets[0];
    const next = [...photos, { uri: asset.uri, key: null }];
    onChange(next);
    setUploading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener la sesión.');
      const adjunto = await uploadPostMedia(companyId, asset.uri, asset.mimeType ?? 'image/jpeg', token);
      onChange(next.map((p) => (p.uri === asset.uri ? { ...p, key: adjunto.key } : p)));
    } catch (e) {
      onChange(photos);
      showAlert('No se pudo subir la foto', (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.photoGrid}>
      {photos.map(({ uri, key }, index) => (
        <View key={uri} style={styles.photoSlot}>
          <Image source={{ uri }} style={styles.photoImage} />
          {key === null && (
            <View style={[styles.photoImage, styles.photoUploadingOverlay]}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
          {index === 0 && (
            <View style={[styles.mainBadge, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" style={{ color: theme.screenBackground, fontSize: 10 }}>
                Principal
              </ThemedText>
            </View>
          )}
        </View>
      ))}
      {photos.length < MAX_PHOTOS && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar foto"
          onPress={addPhoto}
          disabled={uploading}
          style={[styles.photoSlot, styles.photoEmpty, { borderColor: theme.surfaceBorder }]}>
          {uploading ? (
            <ActivityIndicator color={theme.textMuted} />
          ) : (
            <SymbolView tintColor={theme.textMuted} name={{ ios: 'camera', android: 'photo_camera', web: 'camera' }} size={22} />
          )}
        </Pressable>
      )}
    </View>
  );
}

/** Crear Publicación (T3.1) — tipo, saldo del mes (RN-PUB-03), multimedia y especificaciones. */
export default function CrearPublicacionScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const { control, handleSubmit } = useForm<CreatePostForm & { industries: string[] }>({
    defaultValues: { title: '', description: '', industries: [] },
  });
  const [selectedType, setSelectedType] = useState<PostTypeChip>(POST_TYPE_CHIPS[0]);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const photosUploading = photos.some((p) => p.key === null);

  const { quota, error: quotaError, reload: reloadQuota } = useQuota(companyId);
  const { rubros, error: rubrosError, reload: reloadRubros } = useRubrosCatalog();
  const { blocked, error: blockedError } = useCompanyBlocked(companyId);

  const typeQuota = quota?.cupos[selectedType.tipo];
  const outOfQuota = typeQuota ? !typeQuota.permitida || typeQuota.saldo <= 0 : false;
  const canPublish = !outOfQuota && !!quota && !quotaError && !blocked && !photosUploading;

  function onSubmit(data: CreatePostForm & { industries: string[] }) {
    if (!canPublish || submitting) return;
    setSubmitting(true);
    const adjuntos: AdjuntoView[] = photos
      .filter((p): p is PendingPhoto & { key: string } => p.key !== null)
      .map((p) => ({ tipo: 'IMAGEN', key: p.key }));
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return createPost(
          {
            companyId,
            tipo: selectedType.tipo,
            subtipo: selectedType.subtipo,
            rubros: data.industries,
            titulo: data.title,
            descripcion: data.description,
            adjuntos,
          },
          token
        );
      })
      .then(() => {
        showAlert('Publicación creada', `"${data.title}" se publicó como ${selectedType.label}.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      })
      .catch((e: Error) => showAlert('No se pudo publicar', e.message))
      .finally(() => setSubmitting(false));
  }

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <View>
            <ThemedText type="small" style={{ color: theme.accent, fontWeight: '700' }}>
              Paso 1 de 2
            </ThemedText>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary, fontSize: 18 }}>
              Crear Publicación
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            onPress={() => router.back()}
            style={styles.headerButton}>
            <SymbolView tintColor={theme.textMuted} name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} />
          </Pressable>
        </View>

        {blocked && (
          <ThemedText type="small" style={{ color: theme.error, textAlign: 'center', paddingHorizontal: Spacing.three }}>
            Tu empresa está bloqueada y no puede publicar.
          </ThemedText>
        )}
        {blockedError && (
          <ThemedText type="small" style={{ color: theme.textMuted, textAlign: 'center', paddingHorizontal: Spacing.three }}>
            No pudimos confirmar el estado de tu empresa ({blockedError}).
          </ThemedText>
        )}

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="smallBold">Tipo de Publicación*</ThemedText>
          <TypeSelector selected={selectedType} onSelect={setSelectedType} />
          <QuotaBadge chip={selectedType} quota={quota} error={quotaError} onRetry={reloadQuota} />

          <ThemedText type="smallBold">Activos Multimedia</ThemedText>
          <ThemedText type="small" style={{ color: theme.textMuted }}>
            Fotos (máx. {MAX_PHOTOS})
          </ThemedText>
          <PhotoPicker photos={photos} onChange={setPhotos} companyId={companyId} />

          <ThemedText type="smallBold">Especificaciones</ThemedText>
          <FormInput control={control} name="title" label="Título*" placeholder="Ej. Ofrezco servicio de auditoría" rules={{ required: 'Requerido' }} />
          <IndustrySelector
            control={control}
            rubros={rubros}
            error={rubrosError}
            onRetry={reloadRubros}
            saldoDisponible={typeQuota?.saldo ?? null}
          />
          <FormInput
            control={control}
            name="description"
            label="Descripción*"
            placeholder="Describí tu publicación"
            multiline
            rows={4}
            rules={{ required: 'Requerido' }}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={
              submitting
                ? 'Publicando…'
                : blocked
                  ? 'Empresa bloqueada'
                  : outOfQuota
                    ? 'Sin cupo disponible'
                    : photosUploading
                      ? 'Subiendo fotos…'
                      : 'Publicar'
            }
            onPress={handleSubmit(onSubmit)}
            disabled={!canPublish || submitting}
          />
          {outOfQuota && !blocked && (
            <ThemedText type="small" style={{ color: theme.error, textAlign: 'center' }}>
              Agotaste el cupo mensual de publicaciones tipo {selectedType.label}.
            </ThemedText>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
  field: {
    gap: Spacing.one,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 44,
  },
  quotaBadge: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  photoSlot: {
    width: 80,
    height: 80,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoUploadingOverlay: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    borderRadius: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  footer: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
