import { useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import {
  CurpField,
  DiscardButton,
  EditTopBar,
  FormField,
  FormSection,
  InfoNote,
  PhotoCard,
  SaveButton,
  MultiSelectField,
  SelectField,
} from '@/components/profile/profile-form';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useDiscardGuard } from '@/hooks/use-discard-guard';

import { buildEditProfileForm, MOCK_PROFILE, type EditProfileForm } from '@/components/profile/profile-data';
import { StatusPill } from '@/components/profile/profile-primitives';
import { showAlert } from '@/components/ui/app-alert';
import { COUNTRIES, LANGUAGES } from '@/constants/catalogs';
import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useSetProfileAvatarUrl } from '@/hooks/use-profile-avatar';
import { useTheme } from '@/hooks/use-theme';
import { fetchUserProfile, updateUserProfile, uploadProfilePhoto, type UpdateUserProfileInput, type UserProfileView } from '@/utils/api';

/** Compara el form editado contra lo último que vino del servidor y arma el PATCH con solo lo
 * que cambió. */
function buildProfilePatch(original: UserProfileView, form: EditProfileForm): UpdateUserProfileInput {
  const patch: UpdateUserProfileInput = {};
  if (form.firstName !== original.nombre) patch.nombre = form.firstName;
  if (form.paternalLastName !== original.apellidoPaterno) patch.apellidoPaterno = form.paternalLastName;
  if (form.maternalLastName !== (original.apellidoMaterno ?? '')) patch.apellidoMaterno = form.maternalLastName;
  if (form.country !== original.pais) patch.pais = form.country;
  if (form.languages.join('|') !== (original.idiomas ?? []).join('|')) patch.idiomas = form.languages;
  if (form.state !== original.estado) patch.estado = form.state;
  if (form.municipality !== original.comuna) patch.comuna = form.municipality;
  if (form.phone !== original.celular) patch.phoneNumber = form.phone;
  return patch;
}

export default function EditarPerfilScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  const [original, setOriginal] = useState<UserProfileView | null>(null);
  const [form, setForm] = useState<EditProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [avatar, setAvatar] = useState<ImageSourcePropType>(MOCK_PROFILE.avatarUri);
  const setProfileAvatarUrl = useSetProfileAvatarUrl();
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const set = <K extends keyof EditProfileForm>(key: K) => (value: EditProfileForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  // ponytail: deps en `user?.id`, no en `user` — Clerk puede emitir un objeto `user` nuevo con
  // los mismos datos, y depender de la referencia completa reabre el fetch en loop.
  const load = useCallback(() => {
    const userId = user?.id;
    if (!userId) return;
    getToken()
      .then((token) => {
        setLoading(true);
        setLoadError(null);
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return fetchUserProfile(userId, token);
      })
      .then((profile) => {
        setOriginal(profile);
        setForm(buildEditProfileForm(profile, email));
        if (profile.fotoPerfilUrl) setAvatar({ uri: profile.fotoPerfilUrl });
      })
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [user?.id, email, getToken]);

  useEffect(load, [load]);

  const hasUnsavedChanges = useMemo(
    () => (original && form ? Object.keys(buildProfilePatch(original, form)).length > 0 : false),
    [original, form],
  );
  const allowExit = useDiscardGuard(hasUnsavedChanges, { title: '¿Descartar modificaciones?' });

  async function pickAndUploadPhoto() {
    setPhotoError(null);
    try {
      if (!user) throw new Error('La sesión todavía no cargó. Espera un segundo y vuelve a intentarlo.');

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
      if (uploaded.fotoPerfilUrl) {
        setAvatar({ uri: uploaded.fotoPerfilUrl });
        setProfileAvatarUrl(uploaded.fotoPerfilUrl); // barra inferior y topbars
      }
    } catch (e) {
      console.error('[editar-perfil] pickAndUploadPhoto failed', e);
      setPhotoError(e instanceof Error ? e.message : 'No se pudo subir la foto de perfil.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const userId = user?.id;
    if (!userId || !original || !form) return;
    const patch = buildProfilePatch(original, form);
    if (Object.keys(patch).length === 0) return;
    if (form.languages.length === 0) {
      setSaveError('Elige al menos un idioma.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener la sesión.');
      const updated = await updateUserProfile(userId, patch, token);
      setOriginal(updated);
      setForm(buildEditProfileForm(updated, email));
      allowExit();
      router.back();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <EditTopBar title="Editar Perfil" eyebrow="BizAInet Core" avatar={avatar} onBack={() => router.back()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{loadError}</ThemedText>
          <Pressable accessibilityRole="button" onPress={load} style={styles.retry}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Reintentar
            </ThemedText>
          </Pressable>
        </View>
      ) : form ? (
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
            <FormField label="Fecha de Nacimiento" value={form.birthDateLabel} editable={false} helper={form.ageLabel} />
            {/* Opciones = catálogo + lo que ya tenga guardado, para no perder un valor fuera de la lista al editar. */}
            <MultiSelectField
              label="Idiomas Principales"
              required
              options={[...new Set([...LANGUAGES, ...form.languages])]}
              value={form.languages}
              onChange={set('languages')}
            />
          </FormSection>

          <FormSection icon="pin" eyebrow="Ubicación y enlace" title="Residencia y Contacto">
            <SelectField
              label="País de Residencia"
              required
              options={COUNTRIES.some((c) => c.value === form.country) ? COUNTRIES : [...COUNTRIES, { label: form.country, value: form.country }]}
              value={form.country}
              onChange={set('country')}
            />
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
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={set('phone')}
              badge={<StatusPill label="WhatsApp OK" variant="success" />}
            />
            <CurpField value={form.curp} badgeLabel="Validado biometría" />
            <ThemedText style={[styles.hint, { color: theme.textMuted }]}>Certificado emitido por RENAPO / BizAInet · Identity Ledger</ThemedText>
          </FormSection>

          {/* ponytail: contraseña/robustez/2FA son de Clerk, no de api-bizmeet — se ocultan en vez
              de mostrar datos inventados (decisión confirmada; integrarlos contra el flujo propio
              de Clerk queda como mejora aparte si hace falta). */}
          <FormSection icon="shield" eyebrow="Seguridad y acceso" title="Credenciales Corporativas">
            <FormField
              label="Correo Electrónico Institucional"
              value={form.email}
              editable={false}
              badge={<StatusPill label="Clerk" variant="accent" />}
            />
            <InfoNote text="El correo y la contraseña de tu cuenta se gestionan desde tu inicio de sesión (Clerk)." />
          </FormSection>

          {saveError && <ThemedText style={{ color: theme.error, textAlign: 'center' }}>{saveError}</ThemedText>}
          <SaveButton label={saving ? 'Guardando…' : 'Guardar Cambios'} onPress={handleSave} disabled={!hasUnsavedChanges || saving} />
          <DiscardButton
            label="Descartar modificaciones"
            onPress={() => original && setForm(buildEditProfileForm(original, email))}
          />
        </ScrollView>
      ) : null}
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
