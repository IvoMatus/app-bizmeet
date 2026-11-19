import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { ProfileIcon } from '@/components/profile/profile-icons';
import { ThemedText } from '@/components/themed-text';
import { Eyebrow } from '@/components/ui/eyebrow';
import { HighlightedTitle } from '@/components/ui/highlighted-title';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Ilustración "constelación" (diseño: canvas "Red — En construcción", variante A).
// ponytail: tamaño fijo 300×262 — en pantallas de menos de ~332dp de ancho se recorta por los
// costados; escalar con onLayout si aparece un dispositivo así.
const ART_W = 300;
const ART_H = 262;
const CX = 150;
const CY = 130;
const ORBIT = 108;
const NODE = 40;
const BADGE = { x: 183, y: 163 };
// Seis nodos en la órbita, alternando empresa ya conectada / lugar pendiente.
const NODES = [-90, -30, 30, 90, 150, 210].map((deg, i) => ({
  x: CX + ORBIT * Math.cos((deg * Math.PI) / 180),
  y: CY + ORBIT * Math.sin((deg * Math.PI) / 180),
  linked: i % 2 === 0,
}));

function ConstellationArt() {
  const theme = useTheme();

  return (
    <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={ART_W} height={ART_H} style={StyleSheet.absoluteFill}>
        <Circle cx={CX} cy={CY} r={ORBIT} fill="none" stroke={theme.accent} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="3 6" />
        <Circle cx={CX} cy={CY} r={68} fill={theme.accentSoft} />
        {NODES.map((n) => (
          <Line
            key={`l${n.x}${n.y}`}
            x1={CX}
            y1={CY}
            x2={n.x}
            y2={n.y}
            stroke={theme.accent}
            strokeWidth={1.5}
            strokeOpacity={n.linked ? 0.6 : 0.45}
            strokeDasharray={n.linked ? undefined : '4 5'}
          />
        ))}
        {NODES.map((n) => (
          <Rect
            key={`r${n.x}${n.y}`}
            x={n.x - NODE / 2}
            y={n.y - NODE / 2}
            width={NODE}
            height={NODE}
            rx={12}
            fill={n.linked ? theme.surface : theme.screenBackground}
            stroke={n.linked ? theme.surfaceBorder : theme.accent}
            strokeWidth={n.linked ? 1 : 1.5}
            strokeDasharray={n.linked ? undefined : '4 4'}
          />
        ))}
        <Circle cx={CX} cy={CY} r={40} fill={theme.accentStrong} />
        {/* Aro del color de fondo: `warningSoft` es translúcido en oscuro. */}
        <Circle cx={BADGE.x} cy={BADGE.y} r={21} fill={theme.screenBackground} />
        <Circle cx={BADGE.x} cy={BADGE.y} r={18} fill={theme.warningSoft} />
        <Circle cx={34} cy={30} r={4} fill={theme.success} />
        <Circle cx={270} cy={236} r={5} fill={theme.warningAccent} />
        <Circle cx={268} cy={22} r={3} fill={theme.accent} />
        <Circle cx={26} cy={244} r={2.5} fill={theme.accent} />
      </Svg>
      {NODES.map((n) => (
        <View key={`g${n.x}${n.y}`} style={[styles.glyph, { left: n.x - NODE / 2, top: n.y - NODE / 2 }]}>
          {n.linked ? (
            <SymbolView name={{ ios: 'building.2.fill', android: 'apartment', web: 'apartment' }} tintColor={theme.accentText} size={20} />
          ) : (
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.accent} size={16} />
          )}
        </View>
      ))}
      <View style={[styles.glyph, styles.core]}>
        <ProfileIcon name="network" color={theme.onButtonDark} width={34} height={33} />
      </View>
      <View style={[styles.glyph, { left: BADGE.x - NODE / 2, top: BADGE.y - NODE / 2 }]}>
        <SymbolView name={{ ios: 'hammer.fill', android: 'construction', web: 'construction' }} tintColor={theme.warningText} size={18} />
      </View>
    </View>
  );
}

/** Destino de la barra inferior todavía sin contenido: ilustración + "En construcción" + salida al Muro.
 * El topbar compartido (ver app-tabs.tsx) ya cubre el safe-area superior y muestra el nombre de la pestaña. */
export function TabPlaceholderScreen({ title, highlight, description }: { title: string; highlight?: string; description: string }) {
  const theme = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.screenBackground }} contentContainerStyle={styles.content}>
      <ConstellationArt />
      <View style={styles.texts}>
        <View accessible accessibilityLabel="En construcción" style={[styles.pill, { backgroundColor: theme.warningSoft }]}>
          <Eyebrow label="EN CONSTRUCCIÓN" color={theme.warningText} />
        </View>
        <HighlightedTitle type="h2" text={title} highlight={highlight} style={styles.centered} />
        <ThemedText type="body" themeColor="textMuted" style={[styles.centered, styles.description]}>
          {description}
        </ThemedText>
      </View>
      <BenefitButton label="Explorar el Muro" variant="outline" arrow onPress={() => router.navigate('/')} style={styles.cta} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  art: {
    width: ART_W,
    height: ART_H,
  },
  glyph: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    left: CX - NODE / 2,
    top: CY - NODE / 2,
  },
  texts: {
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  pill: {
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: 999,
  },
  centered: {
    textAlign: 'center',
  },
  description: {
    maxWidth: 300,
  },
  cta: {
    alignSelf: 'stretch',
  },
});
