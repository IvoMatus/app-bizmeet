import * as Clipboard from 'expo-clipboard';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { LockedNotice } from '@/components/benefits/convenios/convenio-card';
import { avisoBloqueo } from '@/components/benefits/convenios/convenios-data';
import { DetailCard } from '@/components/benefits/shared/detail-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Convenio, RevelarConvenioResult } from '@/utils/api';

type ActivationCodeCardProps = {
  convenio: Convenio;
  secreto: RevelarConvenioResult | null;
  loading: boolean;
  /** Revela (CODIGO) o revela y abre (ENLACE) — ver `useRevelarConvenio`. */
  onUsar: () => void;
};

/** "CÓDIGO DE ACTIVACIÓN": enmascarado hasta "Revelar" (POST /revelar), después "Copiar". */
export function ActivationCodeCard({ convenio, secreto, loading, onUsar }: ActivationCodeCardProps) {
  const theme = useTheme();
  const [copiado, setCopiado] = useState(false);
  const esCodigo = convenio.accion === 'CODIGO';
  const codigo = secreto?.codigo;

  async function copiar() {
    if (!codigo) return;
    await Clipboard.setStringAsync(codigo);
    setCopiado(true);
    AccessibilityInfo.announceForAccessibility('Código copiado');
    setTimeout(() => setCopiado(false), 2000);
  }

  const boton = convenio.bloqueado ? (
    <BenefitButton label="Revelar" locked accessibilityHint={avisoBloqueo(convenio)} onPress={onUsar} />
  ) : !esCodigo ? (
    <BenefitButton
      label="Abrir"
      loading={loading}
      icon={{ ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' }}
      onPress={onUsar}
    />
  ) : codigo ? (
    <BenefitButton
      label={copiado ? 'Copiado' : 'Copiar'}
      icon={copiado ? { ios: 'checkmark', android: 'check', web: 'check' } : { ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }}
      onPress={copiar}
    />
  ) : (
    <BenefitButton label="Revelar" loading={loading} icon={{ ios: 'eye', android: 'visibility', web: 'visibility' }} onPress={onUsar} />
  );

  return (
    <DetailCard
      title={esCodigo ? 'Código de activación' : 'Enlace de canje'}
      icon={{ ios: 'ticket', android: 'confirmation_number', web: 'confirmation_number' }}
      right={
        secreto && (
          <BenefitPill
            label="Validado"
            bg={theme.successSurface}
            fg={theme.textPrimary}
            iconColor={theme.success}
            icon={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
          />
        )
      }>
      {convenio.bloqueado && <LockedNotice text={avisoBloqueo(convenio)} />}

      <View style={[styles.box, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
        <View style={styles.flex}>
          <ThemedText type="small" style={{ color: theme.textMuted, fontSize: 12 }}>
            {esCodigo ? 'Token Empresarial Único' : 'Enlace exclusivo del convenio'}
          </ThemedText>
          <ThemedText
            type="smallBold"
            selectable={!!codigo}
            accessibilityLabel={codigo ? `Código ${codigo}` : 'Código oculto'}
            style={[styles.code, { color: theme.textPrimary }]}>
            {codigo ?? (esCodigo ? '••••-••••-••••' : 'Protegido')}
          </ThemedText>
        </View>
        {boton}
      </View>

      <View style={styles.note}>
        <SymbolView tintColor={theme.textMuted} name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={12} />
        <ThemedText type="small" style={[styles.flex, { color: theme.textMuted, fontSize: 12, lineHeight: 16 }]}>
          {esCodigo
            ? 'Token cifrado e intransferible ligado a tu empresa activa.'
            : 'El enlace se genera para tu empresa activa y queda registrado.'}
        </ThemedText>
      </View>
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  flex: {
    flex: 1,
  },
  code: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 1.5,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
