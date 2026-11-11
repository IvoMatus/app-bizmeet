import { useAuth, useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

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
import { showAlert } from '@/components/ui/app-alert';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { fetchUserProfile, uploadProfilePhoto } from '@/utils/api';

export default function EditarPerfilScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [form, setForm] = useState<EditProfileForm>(MOCK_EDIT_PROFILE);
  const [avatar, setAvatar] = useState<ImageSourcePropType>(MOCK_PROFILE.avatarUri);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const set = <K extends keyof EditProfileForm>(key: K) => (value: EditProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ponytail: deps en `user?.id`, no en `user` — Clerk puede emitir un objeto `user` nuevo con
  // los mismos datos, y depender de la referencia completa reabre el fetch en loop.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    getToken()
      .then((token) => (token ? fetchUserProfile(userId, token) : null))
      .then((profile) => {
        if (profile?.fotoPerfilUrl) setAvatar({ uri: profile.fotoPerfilUrl });
      })
      .catch(() => {
        // ponytail: si falla, se queda con el avatar mock/placeholder; no bloquea la edición.
      });
  }, [user?.id, getToken]);

  async function pickAndUploadPhoto() {
    setPhotoError(null);
    try {
      if (!user) throw new Error('La sesión todavía no cargó. Esperá un segundo y volvé a intentar.');

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert('Permiso requerido', 'Necesitamos acceso a tus fotos para cambiar tu foto de perfil.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      // Preview inmediato con el archivo local: la URL remota tarda en bajar de la red
      // y hasta que no termina de cargar, el <Image> se ve igual que antes (parece que "no cambió nada").
      setAvatar({ uri: asset.uri });
      setUploading(true);
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener la sesión.');
      const uploaded = await uploadProfilePhoto(user.id, asset.uri, token, asset.mimeType);
      if (uploaded.fotoPerfilUrl) setAvatar({ uri: uploaded.fotoPerfilUrl });
    } catch (e) {
      console.error('[editar-perfil] pickAndUploadPhoto failed', e);
      setPhotoError(e instanceof Error ? e.message : 'No se pudo subir la foto de perfil.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <EditTopBar avatar={avatar} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <PhotoCard avatar={avatar} onUpload={uploading ? undefined : pickAndUploadPhoto} />
        {uploading && <ActivityIndicator color={theme.accent} />}
        {photoError && <ThemedText style={{ color: theme.error, textAlign: 'center' }}>{photoError}</ThemedText>}

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
