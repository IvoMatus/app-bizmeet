import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProfileIcon } from '@/components/profile/profile-icons';
import { ProfileData } from '@/components/profile/profile-data';
import { InfoRow, SectionCard, StatusPill } from '@/components/profile/profile-primitives';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** "IDENTIDAD Y RESIDENCIA": fecha/idioma, país, celular. */
export function IdentitySection({ profile }: { profile: ProfileData }) {
  const theme = useTheme();

  return (
    <SectionCard eyebrow="Identidad y residencia" title="Datos Personales y Residencia">
      <View style={styles.twoCol}>
        <View style={[styles.cell, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
          <ThemedText style={[styles.label, { color: theme.textMuted }]}>Fecha de Nacimiento</ThemedText>
          <ThemedText style={[styles.value, { color: theme.textPrimary }]}>{profile.birthDateLabel}</ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textMuted }]}>{profile.ageLabel}</ThemedText>
        </View>
        <View style={[styles.cell, styles.cellEnd, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
          <ThemedText style={[styles.label, { color: theme.textMuted }]}>Idioma de Contacto</ThemedText>
          <ThemedText style={[styles.value, { color: theme.textPrimary }]}>{profile.contactLanguage}</ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textMuted }]}>{profile.contactLanguageDetail}</ThemedText>
        </View>
      </View>
      <InfoRow
        icon="pin"
        label="País y Residencia Fiscal"
        value={`🇲🇽 ${profile.residence.detail}`}
        trailing={<StatusPill label={profile.residence.countryCode} />}
      />
      <InfoRow
        icon="phone"
        label="Celular de Contacto"
        value={profile.phone}
        trailing={<StatusPill label="WhatsApp" variant="success" />}
      />
    </SectionCard>
  );
}

/** "SEGURIDAD Y ACCESO": correo verificado, contraseña y nivel de robustez. */
export function SecuritySection({ profile }: { profile: ProfileData }) {
  const theme = useTheme();

  return (
    <SectionCard eyebrow="Seguridad y acceso" title="Credenciales de la Cuenta">
      <InfoRow
        icon="at"
        label="Correo Electrónico Corporativo"
        value={profile.email}
        trailing={<StatusPill label="Verificado" variant="success" icon="mail-check" />}
      />
      <View style={[styles.passwordBox, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
        <View style={styles.passwordHeader}>
          <ThemedText style={[styles.label, { color: theme.textMuted }]}>Contraseña</ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textMuted }]}>{profile.passwordChangedLabel}</ThemedText>
        </View>
        <View style={styles.passwordRow}>
          <ProfileIcon name="lock" color={theme.accent} width={16} height={16} />
          <ThemedText style={[styles.mono, { color: theme.textPrimary }]}>{profile.passwordMask}</ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel="Actualizar contraseña" style={styles.linkButton}>
            <ThemedText style={[styles.link, { color: theme.accent }]}>Actualizar</ThemedText>
          </Pressable>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
        <View style={styles.strengthRow}>
          <ProfileIcon name="shield" color={theme.success} width={16} height={16} />
          <ThemedText style={[styles.hint, { color: theme.textMuted, flexShrink: 1 }]}>
            Nivel:{' '}
            <ThemedText style={[styles.hint, { color: theme.success, fontWeight: '600' }]}>
              {profile.passwordStrengthLabel}
            </ThemedText>{' '}
            (8+ car., mayús., símbolos)
          </ThemedText>
        </View>
      </View>
    </SectionCard>
  );
}

/** Tarjeta KYC con borde izquierdo verde, estado aprobado y documento. */
export function KycSection({ profile }: { profile: ProfileData }) {
  const theme = useTheme();

  return (
    <SectionCard kyc eyebrow="KYC • Biometría digital">
      <View style={styles.kycHeader}>
        <ThemedText style={[styles.kycTitle, { color: theme.textPrimary }]}>Identificación Oficial</ThemedText>
        <ProfileIcon name="verified" color={theme.success} width={28} height={28} />
      </View>
      <ThemedText style={[styles.body, { color: theme.textMuted }]}>
        {profile.kycSummary}{' '}
        <ThemedText style={[styles.body, { color: theme.success, fontWeight: '600' }]}>{profile.kycAccuracy}</ThemedText>
      </ThemedText>
      <InfoRow
        icon="document"
        label={profile.kycDocumentName}
        trailing={
          <Pressable accessibilityRole="link" accessibilityLabel="Ver documento" style={styles.linkButton}>
            <ThemedText style={[styles.link, { color: theme.accent }]}>Ver documento</ThemedText>
            <ProfileIcon name="external" color={theme.accent} width={14} height={14} />
          </Pressable>
        }
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cell: {
    flex: 1,
    padding: Spacing.two + Spacing.half,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.half,
  },
  cellEnd: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
  },
  passwordBox: {
    padding: Spacing.two + Spacing.half,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mono: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half + 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kycTitle: {
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
});
