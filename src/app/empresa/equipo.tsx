import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthToken } from '@/hooks/use-auth-token';

import { RegisterHeader } from '@/components/register/register-header';
import { showAlert } from '@/components/ui/app-alert';
import {
  InviteFormCard,
  MemberCard,
  OwnerCard,
  QuotaCard,
  SafeguardCard,
} from '@/components/team/team-sections';
import {
  activeCount,
  buildTeamData,
  pendingCount,
  ROLE_LABEL,
  type ConfirmedMember,
  type PendingMember,
  type TeamData,
} from '@/components/team/team-data';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  cancelCompanyInvitation,
  fetchCompany,
  fetchCompanyInvitations,
  fetchCompanyMembers,
  inviteCompanyMember,
  removeCompanyMember,
  updateCompanyMemberRole,
  type RolEmpresa,
} from '@/utils/api';

/** Vista Equipo — "Equipo y Contactos" (Figma 2006:5286). Recibe el id de empresa por query,
 * igual que `/empresa/[id]`. */
export default function EquipoScreen() {
  const theme = useTheme();
  const getToken = useAuthToken();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then(async (token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        const [company, miembros, invitaciones] = await Promise.all([
          fetchCompany(companyId, token),
          fetchCompanyMembers(companyId, token),
          fetchCompanyInvitations(companyId, token),
        ]);
        // `company.plan` es el código de plan en texto plano (confirmado con backend-dev);
        // `CompanyDetail.plan` en api.ts todavía lo tipa como objeto — fix aparte pendiente.
        const planCode = company.plan as unknown as string;
        setTeam(buildTeamData(company.name, planCode, planCode, miembros, invitaciones));
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken, companyId]);

  useEffect(() => {
    load();
  }, [load]);

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

  /** Ejecuta `action` con el token de sesión y recarga el equipo al terminar. Deja que el
   * caller decida si muestra éxito o deja que el error se propague (p.ej. `InviteFormCard`
   * ya muestra su propio alert de éxito, así que ahí no usamos `withTokenAlert`). */
  const withToken = async (action: (token: string) => Promise<void>) => {
    const token = await getToken();
    if (!token) throw new Error('No se pudo obtener la sesión.');
    await action(token);
    load();
  };

  const withTokenAlert = (action: (token: string) => Promise<void>, failTitle: string) =>
    withToken(action).catch((e: Error) => showAlert(failTitle, e.message));

  const handleInvite = (correo: string, rol: RolEmpresa) => withToken((token) => inviteCompanyMember(companyId, correo, rol, token).then(() => undefined));

  const handleResend = (member: PendingMember) =>
    withTokenAlert(
      async (token) => {
        await cancelCompanyInvitation(companyId, member.id, token);
        await inviteCompanyMember(companyId, member.email, member.role === ROLE_LABEL.ADMINISTRADOR ? 'ADMINISTRADOR' : 'INVITADO', token);
      },
      'No se pudo reenviar la invitación',
    );

  const handleCancel = (member: PendingMember) =>
    withTokenAlert((token) => cancelCompanyInvitation(companyId, member.id, token), 'No se pudo cancelar la invitación');

  const handleRemove = (member: ConfirmedMember) =>
    withTokenAlert((token) => removeCompanyMember(companyId, member.id, token), 'No se pudo quitar al colaborador');

  const handleChangeRole = (member: ConfirmedMember) => {
    const currentIsAdmin = member.role === ROLE_LABEL.ADMINISTRADOR;
    showAlert(member.name, '¿Qué querés hacer con este colaborador?', [
      {
        text: currentIsAdmin ? 'Hacer Invitado' : 'Hacer Administrador',
        onPress: () =>
          withTokenAlert(
            (token) => updateCompanyMemberRole(companyId, member.id, currentIsAdmin ? 'INVITADO' : 'ADMINISTRADOR', token),
            'No se pudo cambiar el rol',
          ),
      },
      { text: 'Quitar del equipo', style: 'destructive', onPress: () => handleRemove(member) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

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
            onInvite={handleInvite}
          />

          {team.owner && <OwnerCard owner={team.owner} />}

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
              <MemberCard
                key={member.id}
                member={member}
                onResend={handleResend}
                onCancel={handleCancel}
                onChangeRole={handleChangeRole}
              />
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
