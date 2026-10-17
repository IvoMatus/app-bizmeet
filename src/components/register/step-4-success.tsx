import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/register/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BASIC_PERKS = [
  'Ver publicaciones de las empresas',
  'Nombres de empresas del sistema',
  'Requerimientos publicados',
  'Ver agenda de eventos públicos',
  'Ver convenios institucionales',
];

const PREMIUM_PERKS = [
  'Publicar en muros segmentados',
  'Ver contacto directo de tomadores de decisión',
  'Mensajes privados ilimitados',
  'Acceso prioritario a eventos exclusivos',
  'Descuentos y beneficios de convenios',
];

type Step4SuccessProps = {
  onUpgrade: () => void;
  onContinueBasic: () => void;
};

/** Paso 4: éxito del registro + selección de perfil (básico vs. premium). */
export function Step4Success({ onUpgrade, onContinueBasic }: Step4SuccessProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.duration(400)} style={styles.badgeWrap}>
        <View style={[styles.badgeCircle, { backgroundColor: theme.success }]}>
          <SymbolView
            tintColor={theme.background}
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={36}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(500).delay(150)} style={styles.headingBlock}>
        <ThemedText type="subtitle" style={styles.centerText}>
          ¡Bienvenido, <ThemedText type="subtitle" themeColor="accent">ya eres parte</ThemedText> de
          la comunidad!
        </ThemedText>
        <ThemedText type="default" themeColor="textMuted" style={styles.centerText}>
          Tu registro inicial se ha completado exitosamente con credenciales verificadas.
        </ThemedText>
      </Animated.View>

      <ThemedView type="cardElevated" style={[styles.warningCard, { borderColor: theme.warning }]}>
        <ThemedText type="smallBold" themeColor="warning">
          Aviso de alcance de cuenta
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          Recuerda que tu perfil de persona estará limitado hasta que inscribas a tu empresa o
          prestador de servicio.
        </ThemedText>
      </ThemedView>

      <ThemedView type="card" style={styles.card}>
        <ThemedText type="smallBold">Perfil Básico</ThemedText>
        <PerkList perks={BASIC_PERKS} tint={theme.textMuted} />
      </ThemedView>

      <ThemedView type="cardElevated" style={[styles.card, styles.premiumCard, { borderColor: theme.accent }]}>
        <View style={styles.premiumBadge}>
          <ThemedText type="small" themeColor="accentStrong">
            RECOMENDADO · MÁXIMO VALOR
          </ThemedText>
        </View>
        <ThemedText type="smallBold">Empresa / Persona Premium</ThemedText>
        <PerkList perks={PREMIUM_PERKS} tint={theme.accent} />
      </ThemedView>

      <PrimaryButton
        label="Inscribir Empresa / Persona Premium"
        icon={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
        // TODO: navigate to company/premium enrollment flow (not built yet).
        onPress={onUpgrade}
      />

      <PrimaryButton
        label="Continuar con perfil básico"
        icon={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
        // TODO: navigate into the app home once onboarding is complete.
        onPress={onContinueBasic}
      />

      <ThemedText type="small" themeColor="textMuted" style={styles.centerText}>
        Puedes cambiar de plan o registrar tu empresa en cualquier momento desde tu perfil.
      </ThemedText>
    </View>
  );
}

function PerkList({ perks, tint }: { perks: string[]; tint: string }) {
  return (
    <View style={styles.perkList}>
      {perks.map((perk) => (
        <View key={perk} style={styles.perkRow}>
          <SymbolView
            tintColor={tint}
            name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check' }}
            size={14}
          />
          <ThemedText type="small" style={styles.perkText}>
            {perk}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  badgeWrap: {
    alignItems: 'center',
  },
  badgeCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBlock: {
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  warningCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  premiumCard: {
    borderWidth: 1,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
  },
  perkList: {
    gap: Spacing.one,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  perkText: {
    flex: 1,
  },
});
