import { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  CurpField,
  DiscardButton,
  EditTopBar,
  FormField,
  FormSection,
  InfoNote,
  PasswordField,
  PhotoCard,
  SaveButton,
  SelectField,
  ToggleRow,
} from '@/components/profile/profile-form';
import { MOCK_EDIT_PROFILE, MOCK_PROFILE, type EditProfileForm } from '@/components/profile/profile-data';
import { StatusPill } from '@/components/profile/profile-primitives';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function EditarPerfilScreen() {
  const theme = useTheme();
  const [form, setForm] = useState<EditProfileForm>(MOCK_EDIT_PROFILE);
  const set = <K extends keyof EditProfileForm>(key: K) => (value: EditProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <EditTopBar avatar={MOCK_PROFILE.avatarUri} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <PhotoCard avatar={MOCK_PROFILE.avatarUri} />

        <FormSection icon="person" eyebrow="Identidad corporativa" title="Datos Personales">
          <FormField label="Nombre(s)" required value={form.firstName} onChangeText={set('firstName')} />
          <View style={styles.row}>
            <View style={styles.half}>
              <FormField label="Primer Apellido" required value={form.paternalLastName} onChangeText={set('paternalLastName')} />
            </View>
            <View style={styles.half}>
              <FormField label="Segundo Apellido" value={form.maternalLastName} onChangeText={set('maternalLastName')} />
            </View>
          </View>
          <FormField label="Cargo / Posición Ejecutiva" required value={form.position} onChangeText={set('position')} />
          <FormField label="Fecha de Nacimiento" value={form.birthDate} onChangeText={set('birthDate')} />
          <SelectField label="Idiomas Principales" value={form.languages} />
        </FormSection>

        <FormSection icon="pin" eyebrow="Ubicación y enlace" title="Residencia y Contacto">
          <SelectField label="País de Residencia" required value={form.countryLabel} />
          <View style={styles.row}>
            <View style={styles.half}>
              <FormField label="Estado / Entidad" value={form.state} onChangeText={set('state')} />
            </View>
            <View style={styles.half}>
              <FormField label="Alcaldía / Comuna" value={form.municipality} onChangeText={set('municipality')} />
            </View>
          </View>
          <FormField
            label="Número Telefónico Directo"
            required
            prefix="+52"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={set('phone')}
            badge={<StatusPill label="WhatsApp OK" variant="success" />}
          />
          <CurpField value={form.curp} badgeLabel="Validado biometría" />
          <ThemedText style={[styles.hint, { color: theme.textMuted }]}>Certificado emitido por RENAPO / BizAInet · Identity Ledger</ThemedText>
        </FormSection>

        <FormSection icon="shield" eyebrow="Seguridad y acceso" title="Credenciales Corporativas">
          <FormField
            label="Correo Electrónico Institucional"
            value={form.email}
            editable={false}
            badge={<StatusPill label="SSO Enterprise" variant="accent" />}
          />
          <InfoNote text="Para modificar tu cuenta corporativa se requiere ticket autorizado ante el departamento de TI." />
          <PasswordField mask={form.passwordMask} strengthLabel={form.passwordStrengthLabel} />
          <ToggleRow
            label="Autenticación en 2 Pasos (2FA)"
            description={form.twoFactorLabel}
            value={form.twoFactorEnabled}
            onValueChange={set('twoFactorEnabled')}
          />
        </FormSection>

        <SaveButton label="Guardar Cambios" />
        <DiscardButton label="Descartar modificaciones" onPress={() => setForm(MOCK_EDIT_PROFILE)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  half: {
    flex: 1,
  },
  hint: {
    fontSize: 11,
    lineHeight: 16,
  },
});
