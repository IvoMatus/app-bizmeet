import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, useWatch } from 'react-hook-form';

import { DiscardButton } from '@/components/profile/profile-form';
import { PrimaryButton } from '@/components/register/primary-button';
import { RegisterHeader } from '@/components/register/register-header';
import { ThemedView } from '@/components/themed-view';
import { showAlert } from '@/components/ui/app-alert';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect, type FormSelectOption } from '@/components/ui/form-select';
import { Spacing } from '@/constants/theme';
import { createCompany, type CreateCompanyInput } from '@/utils/api';

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
  const { getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
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
      await createCompany(
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

          <PrimaryButton label="Crear Empresa" onPress={handleSubmit(onSubmit)} disabled={submitting} />
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
