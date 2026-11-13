import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { BenefitButton } from '@/components/benefits/shared/benefit-button';
import { BenefitCover } from '@/components/benefits/shared/benefit-cover';
import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { avisoBloqueo, expiraLabel } from '@/components/benefits/convenios/convenios-data';
import { ProviderBadge } from '@/components/benefits/convenios/provider-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Convenio } from '@/utils/api';

/** Pills de etiquetaPartner (con punto) y destacado (con ícono). El verde va en punto/ícono y no en
 * el texto: verde sobre `successSurface` no llega a 4.5:1 y en oscuro ese fondo es translúcido. */
export function ConvenioPills({ convenio }: { convenio: Convenio }) {
  const theme = useTheme();
  return (
    <>
      {convenio.etiquetaPartner && (
        <BenefitPill label={convenio.etiquetaPartner} bg={theme.surface} fg={theme.textPrimary} dot={theme.success} />
      )}
      {convenio.destacado && (
        <BenefitPill
          label={convenio.destacado}
          bg={theme.surface}
          fg={theme.textPrimary}
          icon={{ ios: 'tag.fill', android: 'sell', web: 'sell' }}
          iconColor={theme.success}
        />
      )}
    </>
  );
}

/** Card del listado de Convenios. Toda la card (CTA incluido) abre el detalle, donde se revela el código. */
export function ConvenioCard({ convenio, onPress }: { convenio: Convenio; onPress: () => void }) {
  const theme = useTheme();
  const ctaLabel = convenio.accion === 'CODIGO' ? 'Canjear Código' : 'Ver & Cotizar';
  const aviso = convenio.bloqueado ? avisoBloqueo(convenio) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${convenio.nombre}, ${convenio.subtitulo}. ${aviso ?? ctaLabel}`}
      accessibilityHint="Abre el detalle del convenio"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, opacity: pressed ? 0.95 : 1 },
      ]}>
      <BenefitCover
        uri={convenio.imagenUrl}
        height={150}
        fallbackIcon={{ ios: 'briefcase.fill', android: 'business_center', web: 'business_center' }}
        top={<ConvenioPills convenio={convenio} />}
        bottom={<ProviderBadge proveedor={convenio.proveedor} logoUrl={convenio.logoUrl} />}
      />

      <View style={styles.body}>
        <View style={styles.titles}>
          <ThemedText type="h3" style={{ color: theme.textPrimary }}>
            {convenio.nombre}
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.accentText }}>
            {convenio.subtitulo}
          </ThemedText>
        </View>

        <View style={styles.points}>
          {convenio.puntos.map((punto) => (
            <View key={punto} style={styles.pointRow}>
              <View style={[styles.bullet, { backgroundColor: theme.accent }]} />
              <ThemedText type="body" style={[styles.flexText, { color: theme.textMuted }]}>
                {punto}
              </ThemedText>
            </View>
          ))}
          <View style={styles.pointRow}>
            <SymbolView tintColor={theme.success} name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} style={styles.check} />
            <ThemedText type="smallBold" style={[styles.flexText, { color: theme.textPrimary }]}>
              {convenio.condiciones}
            </ThemedText>
          </View>
        </View>

        {aviso && <LockedNotice text={aviso} />}

        <View style={[styles.footer, { borderTopColor: theme.surfaceBorder }]}>
          <View style={styles.meta}>
            <SymbolView tintColor={theme.warning} name={{ ios: 'timer', android: 'timer', web: 'timer' }} size={14} />
            <ThemedText type="small" style={[styles.flexText, { color: theme.textMuted, fontSize: 12 }]}>
              {expiraLabel(convenio.vigenciaHasta)}
            </ThemedText>
          </View>
          <BenefitButton
            label={ctaLabel}
            variant={convenio.accion === 'CODIGO' ? 'primary' : 'outline'}
            arrow
            locked={convenio.bloqueado}
            onPress={onPress}
          />
        </View>
      </View>
    </Pressable>
  );
}

/** "🔒 Disponible en plan Empresa" — convenio visible pero no canjeable con el plan actual. */
export function LockedNotice({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: theme.warningSurface, borderColor: theme.warningBorder }]}>
      <SymbolView tintColor={theme.warningAccent} name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={14} />
      <ThemedText type="small" style={[styles.flexText, { color: theme.textPrimary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  titles: {
    gap: Spacing.half,
  },
  points: {
    gap: Spacing.one,
  },
  pointRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
    marginHorizontal: 4,
  },
  check: {
    marginTop: 3,
  },
  flexText: {
    flex: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
