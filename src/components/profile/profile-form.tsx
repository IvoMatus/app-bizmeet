import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type ImageSourcePropType,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ProfileIcon } from '@/components/profile/profile-icons';
import { StatusPill, SectionCard } from '@/components/profile/profile-primitives';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Header fijo de Editar Perfil: volver, eyebrow, título y avatar. */
export function EditTopBar({ avatar, onBack }: { avatar: ImageSourcePropType; onBack?: () => void }) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.navBackground }}>
      <View style={[styles.topBar, { borderBottomColor: theme.surfaceBorder }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onBack} style={styles.backButton}>
          <SymbolView name="chevron.left" tintColor={theme.textPrimary} size={18} />
        </Pressable>
        <View style={styles.titleBlock}>
          <ThemedText style={[styles.eyebrow, { color: theme.eyebrow }]}>BizAInet Core</ThemedText>
          <ThemedText style={[styles.title, { color: theme.textPrimary }]}>Editar Perfil</ThemedText>
        </View>
        <Image source={avatar} style={[styles.avatar, { borderColor: theme.accent }]} contentFit="cover" />
      </View>
    </SafeAreaView>
  );
}

/** Tarjeta de foto: avatar con botón de cámara, texto de ayuda y acciones. */
export function PhotoCard({
  avatar,
  onUpload,
  onRemove,
}: {
  avatar: ImageSourcePropType;
  onUpload?: () => void;
  onRemove?: () => void;
}) {
  const theme = useTheme();
  const avatarSize = 80;

  return (
    <SectionCard>
      <View style={styles.photoRow}>
        <View style={{ width: avatarSize, height: avatarSize }}>
          <Image
            source={avatar}
            accessibilityLabel="Fotografía de perfil"
            style={[styles.photoAvatar, { borderColor: theme.accent }]}
            contentFit="cover"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar fotografía"
            onPress={onUpload}
            style={[styles.cameraButton, { backgroundColor: theme.accent, borderColor: theme.surface }]}>
            <SymbolView name="camera.fill" tintColor={theme.background} size={12} />
          </Pressable>
        </View>
        <View style={styles.photoText}>
          <ThemedText style={[styles.helper, { color: theme.textMuted }]}>
            JPG o PNG, máx. 5MB. Se muestra en tu credencial BizAInet y red empresarial.
          </ThemedText>
          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onUpload}
              style={[styles.secondaryButton, { backgroundColor: theme.accentSoft }]}>
              <SymbolView name="square.and.arrow.up" tintColor={theme.accent} size={12} />
              <ThemedText style={[styles.secondaryLabel, { color: theme.accent }]}>Subir imagen</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onRemove} style={styles.textButton}>
              <SymbolView name="trash" tintColor={theme.error} size={12} />
              <ThemedText style={[styles.secondaryLabel, { color: theme.error }]}>Eliminar</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SectionCard>
  );
}

/** Sección del formulario: icono de acento, eyebrow, título, acción opcional y línea separadora. */
export function FormSection({
  icon,
  eyebrow,
  title,
  action,
  children,
}: {
  icon: 'person' | 'pin' | 'shield';
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <SectionCard>
      <View style={[styles.sectionHeader, { borderBottomColor: theme.surfaceBorder }]}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.accentSoft }]}>
          <ProfileIcon name={icon} color={theme.accent} width={16} height={16} />
        </View>
        <View style={styles.sectionTitleBlock}>
          <ThemedText style={[styles.eyebrow, { color: theme.eyebrow }]}>{eyebrow}</ThemedText>
          <ThemedText style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</ThemedText>
        </View>
        {action}
      </View>
      {children}
    </SectionCard>
  );
}

/** Campo de texto con label, requerido opcional, prefijo/badge y texto de ayuda. */
export function FormField({
  label,
  value,
  onChangeText,
  required,
  helper,
  badge,
  editable = true,
  prefix,
  ...inputProps
}: Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  required?: boolean;
  helper?: string;
  badge?: ReactNode;
  editable?: boolean;
  prefix?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <ThemedText style={[styles.fieldLabel, { color: theme.textMuted }]}>
          {label}
          {required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
        </ThemedText>
        {badge}
      </View>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: editable ? theme.surfaceInset : theme.surfaceBorder, borderColor: theme.surfaceBorder },
        ]}>
        {prefix && (
          <ThemedText style={[styles.prefix, { color: theme.textMuted, borderRightColor: theme.surfaceBorder }]}>
            {prefix}
          </ThemedText>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={label}
          style={[styles.input, { color: theme.textPrimary }]}
          {...inputProps}
        />
      </View>
      {helper && <ThemedText style={[styles.helperSmall, { color: theme.textMuted }]}>{helper}</ThemedText>}
    </View>
  );
}

/** Campo tipo select: muestra el valor y un chevron. (Sin picker nativo todavía.) */
export function SelectField({ label, value, required }: { label: string; value: string; required?: boolean }) {
  const theme = useTheme();

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.field}>
      <ThemedText style={[styles.fieldLabel, { color: theme.textMuted }]}>
        {label}
        {required && <ThemedText style={{ color: theme.error }}>*</ThemedText>}
      </ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
        <ThemedText style={[styles.input, { color: theme.textPrimary, paddingVertical: Spacing.two + Spacing.half }]}>
          {value}
        </ThemedText>
        <SymbolView name="chevron.down" tintColor={theme.textMuted} size={12} />
      </View>
    </Pressable>
  );
}

/** Campo de contraseña enmascarada con "Actualizar" y barra de robustez (4/4 segmentos). */
export function PasswordField({ mask, strengthLabel, level = 4 }: { mask: string; strengthLabel: string; level?: number }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <ThemedText style={[styles.fieldLabel, { color: theme.textMuted }]}>Contraseña de Acceso</ThemedText>
        <Pressable accessibilityRole="button" accessibilityLabel="Actualizar contraseña">
          <ThemedText style={[styles.secondaryLabel, { color: theme.accent }]}>Actualizar</ThemedText>
        </Pressable>
      </View>
      <View style={[styles.inputWrap, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
        <ThemedText style={[styles.input, styles.mono, { color: theme.textPrimary }]}>{mask}</ThemedText>
        <SymbolView name="eye" tintColor={theme.textMuted} size={16} />
      </View>
      <View style={styles.strengthBar}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.strengthSegment, { backgroundColor: i < level ? theme.success : theme.surfaceBorder }]}
          />
        ))}
      </View>
      <ThemedText style={[styles.helperSmall, { color: theme.success }]}>{strengthLabel}</ThemedText>
    </View>
  );
}

/** Panel con switch (2FA). */
export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.toggleRow, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <View style={styles.toggleText}>
        <ThemedText style={[styles.fieldLabel, { color: theme.textPrimary }]}>{label}</ThemedText>
        <ThemedText style={[styles.helperSmall, { color: theme.textMuted }]}>{description}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        trackColor={{ false: theme.surfaceBorder, true: theme.accent }}
      />
    </View>
  );
}

/** Aviso con icono de info (p. ej. correo SSO). */
export function InfoNote({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <View style={styles.note}>
      <SymbolView name="info.circle" tintColor={theme.textMuted} size={12} />
      <ThemedText style={[styles.helperSmall, { color: theme.textMuted, flex: 1 }]}>{text}</ThemedText>
    </View>
  );
}

/** Botón primario de ancho completo (acento). */
export function SaveButton({ label, onPress }: { label: string; onPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}>
      <SymbolView name="checkmark" tintColor={theme.background} size={14} />
      <ThemedText style={[styles.saveLabel, { color: theme.background }]}>{label}</ThemedText>
    </Pressable>
  );
}

/** Botón secundario centrado con icono X. */
export function DiscardButton({ label, onPress }: { label: string; onPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.discardButton}>
      <SymbolView name="xmark" tintColor={theme.textMuted} size={12} />
      <ThemedText style={[styles.secondaryLabel, { color: theme.textMuted }]}>{label}</ThemedText>
    </Pressable>
  );
}

/** Estado de CURP / identificación: valor en mono + botón de re-validar. */
export function CurpField({ value, badgeLabel }: { value: string; badgeLabel: string }) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <ThemedText style={[styles.fieldLabel, { color: theme.textMuted }]}>CURP / Identificación Fiscal</ThemedText>
        <StatusPill label={badgeLabel} variant="success" />
      </View>
      <View style={styles.curpRow}>
        <View style={[styles.inputWrap, styles.curpInput, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
          <ThemedText style={[styles.input, styles.mono, { color: theme.textPrimary }]}>{value}</ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Re-validar con RENAPO"
          style={[styles.revalidate, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
          <SymbolView name="arrow.clockwise" tintColor={theme.accent} size={16} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  photoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  cameraButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    flex: 1,
    gap: Spacing.two,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    minHeight: 36,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 36,
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    paddingBottom: Spacing.two + Spacing.half,
    borderBottomWidth: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  field: {
    gap: Spacing.one + Spacing.half,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two + Spacing.half,
    minHeight: 44,
    gap: Spacing.two,
  },
  prefix: {
    fontSize: 14,
    fontWeight: '600',
    paddingRight: Spacing.two,
    borderRightWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.two,
  },
  mono: {
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  helperSmall: {
    fontSize: 11,
    lineHeight: 16,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleText: {
    flex: 1,
    gap: Spacing.half,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  saveLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 44,
  },
  curpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  curpInput: {
    flex: 1,
  },
  revalidate: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
