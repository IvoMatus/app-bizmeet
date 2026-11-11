import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegisterHeader } from '@/components/register/register-header';
import { showAlert } from '@/components/ui/app-alert';
import {
  InviteFormCard,
  MemberCard,
  OwnerCard,
  QuotaCard,
  SafeguardCard,
} from '@/components/team/team-sections';
import { activeCount, MOCK_TEAM, pendingCount, type PendingMember, type TeamData } from '@/components/team/team-data';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Vista Equipo — "Equipo y Contactos" (Figma 2006:5286). Recibe el id de empresa por query,
 * igual que `/empresa/[id]`. */
export default function EquipoScreen() {
  const theme = useTheme();
  useLocalSearchParams<{ companyId: string }>();
  // TODO(backend): sustituir por GET /companies/:id/team cuando el endpoint esté listo (el
  // módulo de roles e invitaciones se está desarrollando en paralelo) — por ahora se carga el
  // mock de entrada, sin fetch real, por lo que el estado de error es inalcanzable hoy.
  const [team, setTeam] = useState<TeamData | null>(() => MOCK_TEAM);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setTeam(MOCK_TEAM);
    setError(null);
  }, []);

  if (error && !team) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <RegisterHeader title="Equipo y Contactos" onBack={() => router.back()} />
          <Pressable onPress={load} style={styles.center}>
            <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Tocá para reintentar.</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!team) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView style={styles.flex}>
          <RegisterHeader title="Equipo y Contactos" onBack={() => router.back()} />
          <ActivityIndicator color={theme.accent} style={styles.loading} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const active = activeCount(team.members);
  const pending = pendingCount(team.members);
  const free = team.quota.totalSlots - active - pending;
  const atLimit = free <= 0;

  const handleResend = (member: PendingMember) =>
    showAlert('Invitación reenviada', `Se reenvió la invitación a ${member.email}.`);
  const handleCancel = (member: PendingMember) =>
    showAlert('Invitación cancelada', `Se canceló la invitación a ${member.email}.`);

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <RegisterHeader title="Equipo y Contactos" onBack={() => router.back()} />
          <View style={styles.headerRow}>
            <ThemedText type="small" themeColor="textMuted" style={styles.flex1}>
              {team.companyName}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Invitar colaborador"
              disabled={atLimit}
              onPress={() => {
                // El formulario de invitación vive más abajo en la misma pantalla (acordeón ya
                // expandido); este botón solo hace scroll visual en el diseño — sin ref a
                // ScrollView por ahora, foco directo en el formulario cuando exista deep-link.
              }}
              style={({ pressed }) => [
                styles.invitePill,
                { backgroundColor: theme.accent, opacity: atLimit ? 0.5 : pressed ? 0.85 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                + Invitar
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <QuotaCard companyName={team.companyName} quota={team.quota} active={active} pending={pending} />

          <InviteFormCard
            disabled={atLimit}
            disabledReason="Alcanzaste el límite de cupos de tu plan. Libera un cupo o mejora tu plan para invitar a más colaboradores."
          />

          <OwnerCard owner={team.owner} />

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="small" style={[styles.eyebrow, { color: theme.eyebrow }]}>
              EQUIPO VINCULADO
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {active} Activos • {pending} Pendiente{pending === 1 ? '' : 's'}
            </ThemedText>
          </View>

          {team.members.length === 0 ? (
            <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
              Todavía no invitaste a ningún colaborador.
            </ThemedText>
          ) : (
            team.members.map((member) => (
              <MemberCard key={member.id} member={member} onResend={handleResend} onCancel={handleCancel} />
            ))
          )}

          <SafeguardCard />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  loading: { marginTop: Spacing.four },
  header: { gap: Spacing.one },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  flex1: { flex: 1 },
  invitePill: { height: 36, paddingHorizontal: Spacing.three, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  emptyText: { textAlign: 'center', paddingVertical: Spacing.four },
});
