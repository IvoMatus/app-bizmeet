import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAccessibilityFocusOnMount } from '@/hooks/use-accessibility-focus-on-mount';
import { useTheme } from '@/hooks/use-theme';

/**
 * ⚠️ PLACEHOLDER — no es el aviso de privacidad oficial. Reemplazar este texto completo por el
 * que entregue legal antes de publicar la app (T1.5, 86bccd1yw). Se muestra marcado como
 * ejemplo en la propia pantalla para que nadie lo tome por definitivo.
 */
const PLACEHOLDER_SECTIONS = [
  {
    title: 'Responsable del tratamiento',
    body: 'BizAInet es responsable del tratamiento de los datos personales que nos proporcionas al registrarte.',
  },
  {
    title: 'Datos que recabamos',
    body: 'Nombre, fecha de nacimiento, país y lugar de residencia, celular, correo electrónico, CURP, idiomas, fotografía de perfil y fotografía de tu identificación oficial.',
  },
  {
    title: 'Finalidades',
    body: 'Crear y administrar tu cuenta, validar tu identidad, conectarte con otras empresas de la red y enviarte notificaciones sobre tu actividad.',
  },
  {
    title: 'Derechos ARCO',
    body: 'Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos escribiendo al canal de contacto que se publique en el aviso oficial.',
  },
];

/** Aviso de privacidad + consentimiento expreso: el botón solo se habilita al marcar la casilla. */
export function PrivacyConsent({ onAccept }: { onAccept: () => void }) {
  const theme = useTheme();
  const headingRef = useAccessibilityFocusOnMount();
  const [accepted, setAccepted] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText ref={headingRef} type="subtitle" accessibilityRole="header">
        Aviso de <ThemedText type="subtitle" themeColor="accent">privacidad</ThemedText>
      </ThemedText>

      <View style={[styles.placeholderBanner, { backgroundColor: theme.warningSoft, borderColor: theme.warningBorder }]}>
        <ThemedText type="smallBold" themeColor="warningText">
          TEXTO DE EJEMPLO — pendiente del aviso de privacidad oficial
        </ThemedText>
      </View>

      {PLACEHOLDER_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <ThemedText type="smallBold" themeColor="textPrimary">
            {section.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {section.body}
          </ThemedText>
        </View>
      ))}

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        accessibilityLabel="He leído y acepto el aviso de privacidad y el tratamiento de mis datos personales"
        onPress={() => setAccepted((v) => !v)}
        style={[styles.checkRow, { borderColor: accepted ? theme.accent : theme.border, backgroundColor: theme.card }]}>
        <SymbolView
          name={
            accepted
              ? { ios: 'checkmark.square.fill', android: 'check_box', web: 'check_box' }
              : { ios: 'square', android: 'check_box_outline_blank', web: 'check_box_outline_blank' }
          }
          tintColor={accepted ? theme.accent : theme.textMuted}
          size={22}
        />
        <ThemedText type="small" themeColor="textPrimary" style={styles.checkLabel}>
          He leído y acepto el aviso de privacidad y el tratamiento de mis datos personales.
        </ThemedText>
      </Pressable>

      <PrimaryButton label="Aceptar y continuar" onPress={onAccept} disabled={!accepted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  placeholderBanner: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
  section: {
    gap: Spacing.one,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    minHeight: 48,
  },
  checkLabel: {
    flex: 1,
  },
});
