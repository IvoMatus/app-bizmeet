import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useController, useForm, type Control } from 'react-hook-form';

import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showAlert } from '@/components/ui/app-alert';
import { FormDatePicker } from '@/components/ui/form-date-picker';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const COUNTRIES = [{ label: 'México 🇲🇽', value: 'MX' }];
const STATES = [{ label: 'Ciudad de México', value: 'CDMX' }];
const CITIES = [{ label: 'Cuauhtémoc', value: 'cuauhtemoc' }];
const COUNTRY_CODES = [{ label: '+52 🇲🇽', value: '+52' }];
const LANGUAGES = ['Español', 'Inglés', 'Portugués'];

export type PersonalDataForm = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: Date;
  pais: string;
  estado: string;
  comuna: string;
  codigoPais: string;
  celular: string;
  idiomas: string[];
  curp: string;
  fotoPerfilUri?: string;
  documentoIdentidadUri?: string;
};

const defaultValues: PersonalDataForm = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: undefined as unknown as Date,
  pais: 'MX',
  estado: 'CDMX',
  comuna: 'cuauhtemoc',
  codigoPais: '+52',
  celular: '',
  idiomas: [],
  curp: '',
  fotoPerfilUri: undefined,
  documentoIdentidadUri: undefined,
};

function ProfilePhotoPicker({ control }: { control: Control<PersonalDataForm> }) {
  const theme = useTheme();
  const { field } = useController({ control, name: 'fotoPerfilUri' });

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permiso requerido', 'Necesitamos acceso a tus fotos para elegir una foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      field.onChange(result.assets[0].uri);
    }
  }

  return (
    <Pressable style={styles.avatarRow} onPress={pickPhoto}>
      <View style={[styles.avatar, { backgroundColor: theme.cardElevated }]}>
        {field.value ? (
          <Image source={{ uri: field.value }} style={styles.avatarImage} />
        ) : (
          <SymbolView
            tintColor={theme.accent}
            name={{ ios: 'camera.fill', android: 'photo_camera', web: 'camera' }}
            size={22}
          />
        )}
      </View>
      <ThemedText type="small" themeColor="textMuted">
        JPG o PNG, máx. 5MB
      </ThemedText>
    </Pressable>
  );
}

function DocumentPhotoPicker({ control }: { control: Control<PersonalDataForm> }) {
  const theme = useTheme();
  const { field } = useController({ control, name: 'documentoIdentidadUri' });

  async function pickDocument() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir el documento.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      field.onChange(result.assets[0].uri);
    }
  }

  return (
    <Pressable style={[styles.dropzone, { borderColor: theme.border }]} onPress={pickDocument}>
      {field.value ? (
        <Image source={{ uri: field.value }} style={styles.documentPreview} />
      ) : (
        <SymbolView
          tintColor={theme.accent}
          name={{ ios: 'doc.badge.plus', android: 'upload_file', web: 'upload' }}
          size={22}
        />
      )}
      <ThemedText type="small">
        {field.value ? 'Cambiar foto del documento' : 'Subir foto del documento'}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        INE, Pasaporte o Cédula · PNG/JPG hasta 10MB
      </ThemedText>
    </Pressable>
  );
}

function LanguageChips({ control }: { control: Control<PersonalDataForm> }) {
  const theme = useTheme();
  const { field } = useController({ control, name: 'idiomas' });
  const selected: string[] = field.value ?? [];

  const toggle = (lang: string) => {
    field.onChange(
      selected.includes(lang) ? selected.filter((l) => l !== lang) : [...selected, lang]
    );
  };

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">Idiomas de contacto*</ThemedText>
      <View style={styles.chipsRow}>
        {LANGUAGES.map((lang) => {
          const active = selected.includes(lang);
          return (
            <Pressable key={lang} onPress={() => toggle(lang)}>
              <ThemedView
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.accent : theme.card,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}>
                <ThemedText type="small" themeColor={active ? 'background' : 'text'}>
                  {lang}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type Step1PersonalDataProps = {
  onSubmit: (data: PersonalDataForm) => void;
};

/** Paso 1: Datos personales — form + subida de foto de documento (revisión manual, C5). */
export function Step1PersonalData({ onSubmit }: Step1PersonalDataProps) {
  const { control, handleSubmit } = useForm<PersonalDataForm>({ defaultValues });

  return (
    <View style={styles.container}>
      <View style={styles.headingBlock}>
        <ThemedView type="cardElevated" style={styles.badge}>
          <ThemedText type="small" themeColor="accent">
            REGISTRO BIZAINET
          </ThemedText>
        </ThemedView>
        <ThemedText type="subtitle">
          Datos <ThemedText type="subtitle" themeColor="accent">personales</ThemedText>
        </ThemedText>
        <ThemedText type="default" themeColor="textMuted">
          Completa tu información básica para validar tu identidad corporativa en la red neural.
        </ThemedText>
      </View>

      <ThemedView type="card" style={styles.card}>
        <ThemedText type="smallBold">Foto de perfil</ThemedText>
        <ProfilePhotoPicker control={control} />
      </ThemedView>

      <FormInput
        control={control}
        name="nombre"
        label="Nombre(s)*"
        placeholder="Alejandro"
        rules={{ required: 'Requerido' }}
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormInput
            control={control}
            name="apellidoPaterno"
            label="Apellido Paterno*"
            placeholder="Mendoza"
            rules={{ required: 'Requerido' }}
          />
        </View>
        <View style={styles.flex1}>
          <FormInput
            control={control}
            name="apellidoMaterno"
            label="Apellido Materno"
            placeholder="García"
          />
        </View>
      </View>

      <FormDatePicker
        control={control}
        name="fechaNacimiento"
        label="Fecha de nacimiento*"
        rules={{ required: 'Requerido' }}
      />

      <FormSelect control={control} name="pais" label="País de residencia*" options={COUNTRIES} />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <FormSelect control={control} name="estado" label="Estado/Región*" options={STATES} />
        </View>
        <View style={styles.flex1}>
          <FormSelect
            control={control}
            name="comuna"
            label="Comuna/Municipio*"
            options={CITIES}
          />
        </View>
      </View>

      <ThemedText type="smallBold">Número de celular*</ThemedText>
      <View style={styles.row}>
        <View style={styles.codeField}>
          <FormSelect control={control} name="codigoPais" options={COUNTRY_CODES} />
        </View>
        <View style={styles.flex1}>
          <FormInput
            control={control}
            name="celular"
            placeholder="55 1234 5678"
            keyboardType="phone-pad"
            rules={{ required: 'Requerido' }}
          />
        </View>
      </View>

      <LanguageChips control={control} />

      <FormInput
        control={control}
        name="curp"
        label="CURP (México)*"
        placeholder="MEXA900101HDFXXX01"
        autoCapitalize="characters"
        rules={{ required: 'Requerido' }}
      />
      <ThemedText type="small" themeColor="textMuted">
        OFICIAL — el formato cambia según el país (CURP México, RUT Chile, RUC/DNI Perú).
      </ThemedText>

      <ThemedView type="card" style={styles.card}>
        <ThemedView type="cardElevated" style={styles.badge}>
          <ThemedText type="small" themeColor="accent">
            REVISIÓN MANUAL
          </ThemedText>
        </ThemedView>
        <ThemedText type="smallBold">Fotografía de documento de identificación</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          Sube una foto clara de tu INE, pasaporte o cédula. Un administrador la revisará antes de validar tu cuenta.
        </ThemedText>
        <DocumentPhotoPicker control={control} />
      </ThemedView>

      <ThemedView type="cardElevated" style={styles.card}>
        <ThemedText type="smallBold" themeColor="accent">
          VALIDACIÓN EJECUTIVA — Red Global de Confianza B2B
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          Tus datos se resguardan en bóvedas criptográficas.
        </ThemedText>
      </ThemedView>

      <PrimaryButton
        label="Continuar al Paso 2"
        icon={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
        // TODO: validate + persist step 1 data before advancing (backend not wired yet).
        onPress={handleSubmit(onSubmit)}
      />

      <ThemedText type="small" themeColor="textMuted" style={styles.footer}>
        Cifrado de grado bancario SSL 256-bit · BizAINet SafeGuard
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  headingBlock: {
    gap: Spacing.two,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  codeField: {
    width: 120,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  documentPreview: {
    width: '100%',
    height: 120,
    borderRadius: Spacing.two,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
  dropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.four,
  },
  footer: {
    textAlign: 'center',
  },
});
