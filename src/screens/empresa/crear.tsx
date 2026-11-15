import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useAuthToken } from '@/hooks/use-auth-token';
import { useDiscardGuard } from '@/hooks/use-discard-guard';
import { useTheme } from '@/hooks/use-theme';

import { DOCUMENT_TYPE_LABEL, KybDocumentsField, type KybDocuments } from '@/components/company/kyb-documents-field';
import {
  DiscardButton,
  EditTopBar,
  FormField,
  FormSection,
  SaveButton,
  SelectField,
} from '@/components/profile/profile-form';
import { showAlert } from '@/components/ui/app-alert';
import { type FormSelectOption } from '@/components/ui/form-select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Spacing } from '@/constants/theme';
import { createCompany, uploadCompanyDocument, type CompanyDocumentType, type CreateCompanyInput } from '@/utils/api';
import { rfcServerError } from '@/utils/company-api';

type FormaJuridica = NonNullable<CreateCompanyInput['formaJuridica']>;

type CrearEmpresaForm = {
  name: string;
  rfc: string;
  industry: string;
  tipo: CreateCompanyInput['tipo'] | '';
  formaJuridica: FormaJuridica;
  plan: CreateCompanyInput['plan'] | '';
};

// El Club no se crea desde la app: hay uno solo (seed del backend) y POST /companies lo rechaza.
const TIPO_OPTIONS: FormSelectOption<CreateCompanyInput['tipo']>[] = [
  { label: 'Cliente', value: 'CLIENTE' },
  { label: 'Partner', value: 'PARTNER' },
];

const PLAN_OPTIONS: FormSelectOption<CreateCompanyInput['plan']>[] = [
  { label: 'Emprendimiento', value: 'EMPRENDIMIENTO' },
  { label: 'Empresa', value: 'EMPRESA' },
  { label: 'Premium', value: 'PREMIUM' },
];

const REQUIRED = { required: 'Requerido' };

export default function CrearEmpresaScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const scrollRef = useRef<ScrollView>(null);
  const [submitting, setSubmitting] = useState(false);
  const [documentos, setDocumentos] = useState<KybDocuments>({});
  const {
    control,
    handleSubmit,
    setError,
    formState: { isDirty },
  } = useForm<CrearEmpresaForm>({
    defaultValues: { name: '', rfc: '', industry: '', tipo: '', formaJuridica: 'JURIDICA', plan: '' },
  });
  const tipo = useWatch({ control, name: 'tipo' });
  const requiereFormaJuridica = tipo === 'CLIENTE';
  const allowExit = useDiscardGuard(isDirty || Object.keys(documentos).length > 0, {
    title: '¿Descartar la empresa?',
    message: 'Perderás los datos y documentos que cargaste.',
  });

  // Todos los campos validables están en la primera card: si algo falla, volver arriba para verlo.
  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  async function onSubmit(data: CrearEmpresaForm) {
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        showAlert('No se pudo crear la empresa', 'Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.');
        return;
      }
      const { id } = await createCompany(
        {
          name: data.name,
          rfc: data.rfc,
          industry: data.industry,
          tipo: data.tipo as CreateCompanyInput['tipo'],
          formaJuridica: requiereFormaJuridica ? data.formaJuridica : undefined,
          plan: data.plan as CreateCompanyInput['plan'],
        },
        token,
      );

      // El endpoint de documentos necesita el id: se suben recién ahora. Un fallo no deshace la
      // empresa ya creada — se avisa qué documentos quedaron sin subir.
      const fallidos: string[] = [];
      for (const [tipo, doc] of Object.entries(documentos) as [CompanyDocumentType, KybDocuments[CompanyDocumentType]][]) {
        if (!doc) continue;
        try {
          await uploadCompanyDocument(id, tipo, doc, token);
        } catch {
          fallidos.push(DOCUMENT_TYPE_LABEL[tipo]);
        }
      }
      if (fallidos.length > 0) {
        showAlert('Empresa creada, pero faltan documentos', `No se pudieron subir: ${fallidos.join(', ')}.`);
      }
      allowExit();
      router.back();
    } catch (e) {
      const rfcError = rfcServerError(e);
      if (rfcError) {
        setError('rfc', { message: rfcError });
        scrollToTop();
        AccessibilityInfo.announceForAccessibility(rfcError);
      } else {
        showAlert('No se pudo crear la empresa', (e as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.surfaceInset }]}>
      <EditTopBar
        title="Crear empresa"
        subtitle="Registra tu empresa en el club"
        onBack={() => router.back()}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection
          squareIcon
          icon={<SymbolView name={{ ios: 'building.2', android: 'business', web: 'business' }} tintColor={theme.accent} size={16} />}
          title="Datos Principales y Fiscales"
          subtitle="Información fiscal y comercial de la empresa">
          <Controller
            control={control}
            name="name"
            rules={REQUIRED}
            render={({ field, fieldState }) => (
              <FormField
                label="Razón Social / Nombre Comercial"
                required
                placeholder="Nombre de la empresa"
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
            rules={REQUIRED}
            render={({ field, fieldState }) => (
              <FormField
                label="Identificador Fiscal (RFC)"
                required
                placeholder="ABC123456XY9"
                autoCapitalize="characters"
                autoCorrect={false}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="industry"
            rules={REQUIRED}
            render={({ field, fieldState }) => (
              <FormField
                label="Rubro"
                required
                placeholder="Tecnología, Retail, Manufactura…"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="tipo"
            rules={REQUIRED}
            render={({ field, fieldState }) => (
              <SelectField
                label="Tipo de Empresa"
                required
                options={TIPO_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          {requiereFormaJuridica && (
            <Controller
              control={control}
              name="formaJuridica"
              render={({ field }) => (
                <SegmentedControl<FormaJuridica>
                  accessibilityLabel="Forma jurídica"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    {
                      value: 'JURIDICA',
                      label: 'Empresa Jurídica',
                      icon: (
                        <SymbolView
                          name={{ ios: 'building.2', android: 'business', web: 'business' }}
                          tintColor={field.value === 'JURIDICA' ? theme.onButtonDark : theme.textMuted}
                          size={16}
                        />
                      ),
                    },
                    {
                      value: 'NATURAL',
                      label: 'Persona Natural',
                      icon: (
                        <SymbolView
                          name={{ ios: 'person', android: 'person', web: 'person' }}
                          tintColor={field.value === 'NATURAL' ? theme.onButtonDark : theme.textMuted}
                          size={16}
                        />
                      ),
                    },
                  ]}
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="plan"
            rules={REQUIRED}
            render={({ field, fieldState }) => (
              <SelectField
                label="Plan"
                required
                options={PLAN_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormSection>

        <FormSection
          squareIcon
          icon="document"
          title="Documentos de la empresa"
          subtitle="Opcionales · JPG, PNG o PDF de hasta 10 MB. Se revisan para validar la empresa.">
          <KybDocumentsField value={documentos} onChange={setDocumentos} />
        </FormSection>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.surfaceBorder }]}>
        <View style={styles.footerButton}>
          <DiscardButton outlined label="Cancelar" onPress={() => router.back()} />
        </View>
        <View style={styles.footerButton}>
          <SaveButton
            label={submitting ? 'Creando…' : 'Crear empresa'}
            loading={submitting}
            onPress={() => handleSubmit(onSubmit, scrollToTop)()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  // Sin inset inferior propio: la barra inferior de (tabs) (app-tabs.tsx) ya lo pone debajo.
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});
