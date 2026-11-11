import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  InviteFromCompanyBanner,
  LinkedCompanyCard,
  PendingInvitationCard,
} from '@/components/invitations/invitations-sections';
import {
  toLinkedCompany,
  toPendingInvitation,
  type LinkedCompany,
  type PendingInvitation,
} from '@/components/invitations/invitations-data';
import { ProfileTabs } from '@/components/profile/profile-chrome';
import { showAlert } from '@/components/ui/app-alert';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { acceptMyInvitation, fetchMyCompanies, fetchMyInvitations, rejectMyInvitation } from '@/utils/api';

type State = { invitations: PendingInvitation[]; companies: LinkedCompany[] };

/** "Invitaciones Corporativas" (Figma 2046:847) — tab hermana de Perfil/Pago/Notif, comparte
 * header y ProfileTabs con la pantalla de Perfil (ver decisión en perfil/_layout.tsx). */
export default function InvitacionesScreen() {
  const theme = useTheme();
  const { getToken } = useAuth();
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getToken()
      .then(async (token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        const [invitations, companies] = await Promise.all([fetchMyInvitations(token), fetchMyCompanies(token)]);
        setState({ invitations: invitations.map(toPendingInvitation), companies: companies.map(toLinkedCompany) });
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = (invitation: PendingInvitation) =>
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return acceptMyInvitation(invitation.id, token);
      })
      .then(() => {
        showAlert('Invitación aceptada', `Ahora eres parte de ${invitation.companyName}.`);
        load();
      })
      .catch((e: Error) => showAlert('No se pudo aceptar la invitación', e.message));

  const handleReject = (invitation: PendingInvitation) =>
    getToken()
      .then((token) => {
        if (!token) throw new Error('No se pudo obtener la sesión.');
        return rejectMyInvitation(invitation.id, token);
      })
      .then(() => {
        showAlert('Invitación rechazada', `Rechazaste la invitación de ${invitation.companyName}.`);
        load();
      })
      .catch((e: Error) => showAlert('No se pudo rechazar la invitación', e.message));

  // No existe hoy un endpoint para que un INVITADO se quite a sí mismo de una empresa
  // (`PATCH/DELETE /companies/:id/members/:userId` exige que quien actúa sea Administrador) —
  // se avisa en vez de simular una acción que el backend rechazaría.
  const handleRevoke = (company: LinkedCompany) =>
    showAlert(
      'Todavía no disponible',
      `Por ahora, para salir de ${company.companyName} pedile a un Administrador que te quite del equipo.`,
    );

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <ProfileTabs activeKey="invitaciones" />

      {error && !state && (
        <Pressable onPress={load} style={styles.center}>
          <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>{error} Tocá para reintentar.</ThemedText>
        </Pressable>
      )}

      {!state && !error && <ActivityIndicator color={theme.accent} style={styles.loading} />}

      {state && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleBlock}>
            <ThemedText type="small" style={[styles.eyebrow, { color: theme.eyebrow }]}>
              GOBERNANZA DE CUENTAS
            </ThemedText>
            <ThemedText type="subtitle" themeColor="textPrimary">
              Invitaciones <ThemedText type="subtitle" themeColor="accent">Corporativas</ThemedText>
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              Gestiona las invitaciones que recibiste de otras empresas y las organizaciones a las que ya perteneces.
            </ThemedText>
            <View style={styles.countersRow}>
              <View style={[styles.counterBadge, { backgroundColor: theme.accentSoft }]}>
                <ThemedText type="smallBold" themeColor="accent">
                  {state.invitations.length} PENDIENTE{state.invitations.length === 1 ? '' : 'S'}
                </ThemedText>
              </View>
              <View style={[styles.counterBadge, { backgroundColor: theme.successSurface }]}>
                <ThemedText type="smallBold" themeColor="success">
                  {state.companies.length} EMPRESAS ASOCIADAS
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="smallBold" themeColor="textPrimary">
              Invitaciones Pendientes
            </ThemedText>
            {state.invitations.length > 0 && (
              <View style={[styles.requiresActionBadge, { backgroundColor: theme.warningSoft, borderColor: theme.warningBorder }]}>
                <ThemedText type="small" style={{ color: theme.warningText }}>
                  Requiere acción
                </ThemedText>
              </View>
            )}
          </View>

          {state.invitations.length === 0 ? (
            <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
              No tenés invitaciones pendientes por el momento.
            </ThemedText>
          ) : (
            state.invitations.map((invitation) => (
              <PendingInvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}

          <View style={styles.sectionHeaderRow}>
            <ThemedText type="smallBold" themeColor="textPrimary">
              Empresas Vinculadas
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {state.companies.length} Activas
            </ThemedText>
          </View>

          {state.companies.length === 0 ? (
            <ThemedText type="small" themeColor="textMuted" style={styles.emptyText}>
              Todavía no estás vinculado a ninguna empresa.
            </ThemedText>
          ) : (
            state.companies.map((company) => (
              <LinkedCompanyCard key={company.id} company={company} onRevoke={handleRevoke} />
            ))
          )}

          <InviteFromCompanyBanner />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  loading: { marginTop: Spacing.four },
  content: { padding: Spacing.three, gap: Spacing.three },
  titleBlock: { gap: Spacing.one, marginBottom: Spacing.two },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  countersRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  counterBadge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half + 2, borderRadius: 9999 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requiresActionBadge: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: 6, borderWidth: 1 },
  emptyText: { textAlign: 'center', paddingVertical: Spacing.four },
});
