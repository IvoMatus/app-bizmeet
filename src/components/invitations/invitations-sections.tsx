import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileIcon } from '@/components/profile/profile-icons';
import { SectionCard, StatusPill } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import type { LinkedCompany, PendingInvitation } from '@/components/invitations/invitations-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Card destacada de una invitación pendiente: empresa, cargo propuesto, mensaje y permisos. */
export function PendingInvitationCard({
  invitation,
  onAccept,
  onReject,
}: {
  invitation: PendingInvitation;
  onAccept: (invitation: PendingInvitation) => void;
  onReject: (invitation: PendingInvitation) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.accent }]}>
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
          <ProfileIcon name="network" color={theme.accent} width={16} height={16} />
        </View>
        <View style={styles.flex1}>
          <View style={styles.nameRow}>
            <ThemedText type="smallBold" themeColor="textPrimary" numberOfLines={1} style={styles.flex1}>
              {invitation.companyName}
            </ThemedText>
            {invitation.verified && <ProfileIcon name="verified" color={theme.success} width={12} height={12} />}
          </View>
          <ThemedText type="small" themeColor="textMuted">
            {invitation.industry} · {invitation.location}
          </ThemedText>
        </View>
      </View>

      <StatusPill label="INVITACIÓN VIP" variant="accent" />

      <View style={styles.roleRow}>
        <ProfileIcon name="rosette" color={theme.accent} width={14} height={14} />
        <ThemedText type="smallBold" themeColor="textPrimary">
          {invitation.proposedRole}
        </ThemedText>
      </View>

      <ThemedText type="small" themeColor="textMuted">
        Invitado por <ThemedText type="smallBold" themeColor="textPrimary">{invitation.invitedByName}</ThemedText> (
        {invitation.invitedByRole})
      </ThemedText>

      <View style={[styles.quoteBlock, { backgroundColor: theme.surfaceInset }]}>
        <ThemedText type="small" themeColor="textMuted" style={styles.italic}>
          &ldquo;{invitation.message}&rdquo;
        </ThemedText>
      </View>

      <View>
        <ThemedText type="small" style={[styles.eyebrow, { color: theme.eyebrow }]}>
          PRIVILEGIOS Y PERMISOS
        </ThemedText>
        {invitation.privileges.map((privilege) => (
          <View key={privilege} style={styles.privilegeRow}>
            <View style={[styles.bullet, { backgroundColor: theme.accent }]} />
            <ThemedText type="small" themeColor="textPrimary" style={styles.flex1}>
              {privilege}
            </ThemedText>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Aceptar invitación de ${invitation.companyName}`}
        onPress={() => onAccept(invitation)}
        style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}>
        <ThemedText type="smallBold" style={styles.onAccent}>
          Aceptar Invitación
        </ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Rechazar invitación de ${invitation.companyName}`}
        onPress={() => onReject(invitation)}
        style={({ pressed }) => [styles.outlineButton, { borderColor: theme.error, opacity: pressed ? 0.7 : 1 }]}>
        <ThemedText type="smallBold" themeColor="error">
          Rechazar
        </ThemedText>
      </Pressable>
    </View>
  );
}

/** Card de empresa vinculada: titular (admin) o invitado (puede revocar su membresía). */
export function LinkedCompanyCard({ company, onRevoke }: { company: LinkedCompany; onRevoke: (c: LinkedCompany) => void }) {
  const theme = useTheme();
  const isTitular = company.kind === 'titular';

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: isTitular ? theme.successSurface : theme.accentSoft }]}>
          <ProfileIcon name="home" color={isTitular ? theme.success : theme.accent} width={16} height={16} />
        </View>
        <View style={styles.flex1}>
          <ThemedText type="smallBold" themeColor="textPrimary" numberOfLines={1}>
            {company.companyName}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {isTitular ? 'Titular • Creador de la Organización' : 'Miembro Asociado'}
          </ThemedText>
        </View>
        <StatusPill label={isTitular ? 'EMPRESA TITULAR' : 'ACTIVA'} variant={isTitular ? 'success' : 'accent'} />
      </View>

      <View style={[styles.quoteBlock, { backgroundColor: theme.surfaceInset }]}>
        <ThemedText type="small" themeColor="textMuted">
          {isTitular ? 'Rol ejecutivo' : 'Rol colaborativo'} • Vigente • Plan {company.planLabel}
        </ThemedText>
        <ThemedText type="small" themeColor="textPrimary">
          {company.role}
          {isTitular ? ' (Admin Principal)' : ''}
        </ThemedText>
        {!isTitular && company.invitedByName && (
          <ThemedText type="small" themeColor="textMuted">
            Invitado formalmente por <ThemedText type="smallBold" themeColor="textPrimary">{company.invitedByName}</ThemedText>
          </ThemedText>
        )}
      </View>

      {isTitular ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Administrar Equipo e Invitaciones"
          onPress={() => router.push(`/empresa/equipo?companyId=${company.id}`)}
          // ponytail: #15406a del Figma es el valor dark de buttonDark, no el light (#0c1d32) —
          // posible inconsistencia del diseño, se mantiene theme.buttonDark (el token real de
          // este modo) salvo que el diseñador confirme que debe ser fijo. Ver brief.
          style={({ pressed }) => [styles.darkButton, { backgroundColor: theme.buttonDark, opacity: pressed ? 0.85 : 1 }]}>
          <ThemedText type="smallBold" style={{ color: theme.onButtonDark }}>
            Administrar Equipo e Invitaciones
          </ThemedText>
        </Pressable>
      ) : (
        <>
          <View style={[styles.warningBanner, { backgroundColor: theme.warningSurface, borderColor: theme.warningBorder }]}>
            <ThemedText type="small" style={{ color: theme.warningText }}>
              Si te sales, perderás acceso a esta empresa y a sus publicaciones. Deberás ser invitado nuevamente para
              volver a unirte.
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Revocar membresía de ${company.companyName}`}
            onPress={() => onRevoke(company)}
            style={({ pressed }) => [styles.outlineButton, { borderColor: theme.error, opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText type="smallBold" themeColor="error">
              Revocar membresía / Salirme de esta empresa
            </ThemedText>
          </Pressable>
        </>
      )}
    </View>
  );
}

/** Banner informativo final: cómo invitar colaboradores desde la empresa titular. */
export function InviteFromCompanyBanner() {
  return (
    <SectionCard>
      <ThemedText type="smallBold" themeColor="textPrimary">
        ¿Deseas sumar colaboradores?
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        Para enviar una invitación desde tu empresa titular ve a{' '}
        <ThemedText type="smallBold" themeColor="accent">
          Empresa &gt; Equipo &gt; Invitar Colaborador
        </ThemedText>
        .
      </ThemedText>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  onAccent: { color: '#ffffff' },
  card: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.three },
  headerRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  quoteBlock: { borderRadius: 12, padding: Spacing.three, gap: Spacing.half },
  italic: { fontStyle: 'italic' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.two },
  privilegeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, marginTop: Spacing.one },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  primaryButton: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  outlineButton: { height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  darkButton: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  warningBanner: { borderRadius: 12, borderWidth: 1, padding: Spacing.three },
});
