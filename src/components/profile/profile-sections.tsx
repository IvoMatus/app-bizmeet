import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useAuthToken } from '@/hooks/use-auth-token';

import { ThemedText } from '@/components/themed-text';
import { ProfileData } from '@/components/profile/profile-data';
import { InfoRow, SectionCard, StatusPill } from '@/components/profile/profile-primitives';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { identityDocumentSource, type DocumentoIdentidad } from '@/utils/api';

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
        value={profile.residence.detail}
        trailing={<StatusPill label={profile.residence.countryCode} />}
      />
      <InfoRow
        icon="phone"
        label="Celular de Contacto"
        value={profile.phone}
        trailing={<StatusPill label="WhatsApp" variant="success" />}
      />
      <InfoRow icon="document" label="CURP / Identificación Fiscal" value={profile.curp} />
    </SectionCard>
  );
}

/** "SEGURIDAD Y ACCESO": correo verificado. Contraseña/robustez/2FA se ocultan a propósito — son
 * de Clerk, no de api-bizmeet (decisión confirmada, misma que editar.tsx). */
export function SecuritySection({ profile }: { profile: ProfileData }) {
  return (
    <SectionCard eyebrow="Seguridad y acceso" title="Credenciales de la Cuenta">
      <InfoRow
        icon="at"
        label="Correo Electrónico Corporativo"
        value={profile.email}
        trailing={<StatusPill label="Verificado" variant="success" icon="mail-check" />}
      />
    </SectionCard>
  );
}

const KYC_ESTADO: Record<DocumentoIdentidad['estado'], { pill: string; variant: 'warning' | 'success' | 'error'; texto: string }> = {
  PENDIENTE_REVISION: {
    pill: 'En revisión',
    variant: 'warning',
    texto: 'Un administrador está revisando tu identificación para validar tu cuenta.',
  },
  APROBADO: { pill: 'Validada', variant: 'success', texto: 'Tu identidad está validada.' },
  RECHAZADO: {
    pill: 'Rechazada',
    variant: 'error',
    texto: 'No pudimos validarla. Sube una foto clara y completa de tu INE, pasaporte o cédula.',
  },
};

const fechaFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

/** Foto de la identificación: va contra la API con Bearer (no hay URL firmada) y SIN caché en disco
 * (`cachePolicy="none"`), porque es un documento sensible. */
function IdentityDocumentImage({ documento }: { documento: DocumentoIdentidad }) {
  const theme = useTheme();
  const getToken = useAuthToken();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(setToken).catch(() => setToken(null));
  }, [getToken, documento.subidoEn]);

  return (
    <View style={[styles.kycImage, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      {token && (
        <Image
          source={identityDocumentSource(documento, token)}
          cachePolicy="none"
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Foto de tu identificación oficial"
        />
      )}
    </View>
  );
}

/** Tarjeta KYC: estado real de la identificación oficial (revisión manual) y CTA para subirla o
 * reemplazarla. El borde verde (`kyc`) solo cuando está validada. */
export function KycSection({
  documento,
  onUpload,
  uploading,
}: {
  documento?: DocumentoIdentidad;
  onUpload: () => void;
  uploading: boolean;
}) {
  const theme = useTheme();
  const estado = documento ? KYC_ESTADO[documento.estado] : null;
  const ctaLabel = !documento ? 'Subir identificación' : documento.estado === 'RECHAZADO' ? 'Subir de nuevo' : 'Reemplazar';

  return (
    <SectionCard kyc={documento?.estado === 'APROBADO'} eyebrow="KYC • Validación de identidad">
      <View style={styles.kycHeader}>
        <ThemedText style={[styles.kycTitle, { color: theme.textPrimary }]}>Identificación Oficial</ThemedText>
        {estado && <StatusPill label={estado.pill} variant={estado.variant} />}
      </View>
      <ThemedText style={[styles.body, { color: theme.textMuted }]}>
        {estado
          ? estado.texto
          : 'Todavía no subiste tu identificación oficial (INE, pasaporte o cédula). La necesitamos para validar tu cuenta.'}
      </ThemedText>
      {documento && (
        <>
          <IdentityDocumentImage documento={documento} />
          <ThemedText style={[styles.hint, { color: theme.textMuted }]}>
            Subida el {fechaFormatter.format(new Date(documento.subidoEn))}
          </ThemedText>
        </>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        accessibilityState={{ disabled: uploading, busy: uploading }}
        disabled={uploading}
        onPress={onUpload}
        style={[styles.kycCta, { borderColor: theme.surfaceBorder, backgroundColor: theme.surfaceInset }]}>
        {uploading ? (
          <ActivityIndicator color={theme.accent} />
        ) : (
          <ThemedText type="smallBold" themeColor="accentText">
            {ctaLabel}
          </ThemedText>
        )}
      </Pressable>
      <ThemedText style={[styles.hint, { color: theme.textMuted }]}>JPG o PNG de hasta 10 MB.</ThemedText>
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
  kycImage: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  kycCta: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
});
