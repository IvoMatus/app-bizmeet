import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useTheme } from '@/hooks/use-theme';
import type { CupoConversaciones } from '@/utils/api';

const ASK_ADMIN = 'Pídele al administrador de tu empresa que suba de plan.';

/** Id de la empresa activa si el motor deja cambiarle el plan (`derechos['change-plan']`), si no null. */
function usePlanCompanyId(): string | null {
  const { active, context } = useActiveCompany();
  return active && context?.derechos['change-plan']?.permitida ? active.company.id : null;
}

/** Mismo destino que el CTA de PendingPaymentBanner. */
function PlanLink({ companyId, label, color }: { companyId: string; label: string; color: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={Spacing.two}
      onPress={() => router.push(`/empresa/plan?companyId=${companyId}`, { withAnchor: true })}
      style={styles.link}>
      <ThemedText type="smallBold" style={{ color }}>
        {label}
      </ThemedText>
      <SymbolView tintColor={color} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={14} />
    </Pressable>
  );
}

/**
 * Aviso warning sobre el dock / bajo "Contactar" (sin diseño en Figma): cupo que se va a usar,
 * cupo agotado o solo lectura. Con `planCta`, "Subir de plan" si el motor lo deja; si no, a quién
 * pedírselo.
 */
export function PlanNotice({ message, planCta = false }: { message: string; planCta?: boolean }) {
  const theme = useTheme();
  const planCompanyId = usePlanCompanyId();
  return (
    <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: theme.warningSurface, borderColor: theme.warningBorder }]}>
      <ThemedText type="small" themeColor="warningText" style={styles.noticeText}>
        {message}
        {planCta && !planCompanyId ? ` ${ASK_ADMIN}` : ''}
      </ThemedText>
      {planCta && planCompanyId && <PlanLink companyId={planCompanyId} label="Subir de plan" color={theme.warningText} />}
    </View>
  );
}

/** "Renueva DD/MM" a partir de `YYYY-MM-DD`. */
function renewal(iso: string): string {
  const [, month, day] = iso.split('-');
  return day && month ? `Renueva ${day}/${month}` : '';
}

/** Cupos de conversación de la empresa activa (bandeja, Figma 2046:1122 / 2046:1696). */
export function QuotaCard({ cupo }: { cupo: CupoConversaciones }) {
  const theme = useTheme();
  const planCompanyId = usePlanCompanyId();
  const { saldo, limite } = cupo;
  const hasQuota = saldo !== null && limite !== null;
  const empty = !cupo.permitida || saldo === null || saldo === 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.feedCard, borderColor: theme.surfaceBorder, shadowColor: theme.cardShadow }]}>
      <View style={styles.header}>
        <SymbolView tintColor={theme.accent} name={{ ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' }} size={18} />
        <ThemedText type="smallBold" style={[styles.title, { color: theme.textPrimary }]}>
          Cupos de conversación
        </ThemedText>
        {planCompanyId && <PlanLink companyId={planCompanyId} label="Mejorar plan" color={theme.accentText} />}
      </View>
      {hasQuota && (
        <>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Conversaciones nuevas disponibles este mes"
            accessibilityValue={{ min: 0, max: limite, now: saldo }}
            style={[styles.track, { backgroundColor: theme.surfaceInset }]}>
            <View style={[styles.fill, { backgroundColor: theme.accent, width: `${limite ? Math.min(100, (saldo / limite) * 100) : 0}%` }]} />
          </View>
          <View style={styles.footer}>
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              Te quedan {saldo} de {limite} este mes
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textMuted }}>
              {renewal(cupo.renuevaEl)}
            </ThemedText>
          </View>
        </>
      )}
      {empty && (
        <ThemedText type="small" style={{ color: theme.textMuted }}>
          {saldo === 0 ? 'Sin cupos de conversación este mes.' : 'Tu plan no incluye iniciar conversaciones.'}
          {planCompanyId ? '' : ` ${ASK_ADMIN}`}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three - Spacing.half,
    borderRadius: 12,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    minHeight: 44,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
  },
});
