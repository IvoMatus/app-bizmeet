import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, useWatch } from 'react-hook-form';

import { useAuthToken } from '@/hooks/use-auth-token';

import { DOCUMENT_TYPE_LABEL, KybDocumentsField, type KybDocuments } from '@/components/company/kyb-documents-field';
import { DiscardButton } from '@/components/profile/profile-form';
import { PrimaryButton } from '@/components/register/primary-button';
import { RegisterHeader } from '@/components/register/register-header';
import { ThemedView } from '@/components/themed-view';
import { showAlert } from '@/components/ui/app-alert';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect, type FormSelectOption } from '@/components/ui/form-select';
import { Spacing } from '@/constants/theme';
import { createCompany, uploadCompanyDocument, type CompanyDocumentType, type CreateCompanyInput } from '@/utils/api';

type CrearEmpresaForm = {
  name: string;
  rfc: string;
  industry: string;
  tipo: CreateCompanyInput['tipo'] | '';
  formaJuridica: CreateCompanyInput['formaJuridica'] | '';
  plan: CreateCompanyInput['plan'] | '';
};

const TIPO_OPTIONS: FormSelectOption<CreateCompanyInput['tipo']>[] = [
  { label: 'Club', value: 'CLUB' },
  { label: 'Cliente', value: 'CLIENTE' },
  { label: 'Partner', value: 'PARTNER' },
];

const FORMA_JURIDICA_OPTIONS: FormSelectOption<NonNullable<CreateCompanyInput['formaJuridica']>>[] = [
  { label: 'Jurídica', value: 'JURIDICA' },
  { label: 'Natural', value: 'NATURAL' },
];

const PLAN_OPTIONS: FormSelectOption<CreateCompanyInput['plan']>[] = [
  { label: 'Emprendimiento', value: 'EMPRENDIMIENTO' },
  { label: 'Empresa', value: 'EMPRESA' },
  { label: 'Premium', value: 'PREMIUM' },
];

export default function CrearEmpresaScreen() {
  const getToken = useAuthToken();
  const [submitting, setSubmitting] = useState(false);
  const [documentos, setDocumentos] = useState<KybDocuments>({});
  const { control, handleSubmit, setValue } = useForm<CrearEmpresaForm>({
    defaultValues: { name: '', rfc: '', industry: '', tipo: '', formaJuridica: '', plan: '' },
  });
  const tipo = useWatch({ control, name: 'tipo' });
  const requiereFormaJuridica = tipo === 'CLIENTE';

  useEffect(() => {
    if (!requiereFormaJuridica) setValue('formaJuridica', '');
  }, [requiereFormaJuridica, setValue]);

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
          formaJuridica: requiereFormaJuridica ? (data.formaJuridica as CreateCompanyInput['formaJuridica']) : undefined,
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
      router.back();
    } catch (e) {
      showAlert('No se pudo crear la empresa', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <RegisterHeader title="Crear Empresa" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormInput
            control={control}
            name="name"
            label="Razón Social / Nombre Comercial"
            placeholder="Nombre de la empresa"
            rules={{ required: 'Requerido' }}
          />
          <FormInput
            control={control}
            name="rfc"
            label="Identificador Fiscal (RFC / RUT / CIF)"
            placeholder="RFC123456ABC"
            autoCapitalize="characters"
            rules={{ required: 'Requerido' }}
          />
          <FormInput
            control={control}
            name="industry"
            label="Industria"
            placeholder="Tecnología, Retail, Manufactura…"
            rules={{ required: 'Requerido' }}
          />
          <FormSelect
            control={control}
            name="tipo"
            label="Tipo de Empresa"
            options={TIPO_OPTIONS}
            rules={{ required: 'Requerido' }}
          />
          {requiereFormaJuridica && (
            <FormSelect
              control={control}
              name="formaJuridica"
              label="Forma Jurídica"
              options={FORMA_JURIDICA_OPTIONS}
              rules={{ required: requiereFormaJuridica ? 'Requerido' : false }}
            />
          )}
          <FormSelect
            control={control}
            name="plan"
            label="Plan"
            options={PLAN_OPTIONS}
            rules={{ required: 'Requerido' }}
          />

          <KybDocumentsField value={documentos} onChange={setDocumentos} />

          <PrimaryButton label={submitting ? 'Creando…' : 'Crear Empresa'} onPress={handleSubmit(onSubmit)} disabled={submitting} />
          <DiscardButton label="Cancelar" onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
  },
});
