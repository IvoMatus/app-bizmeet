import { SymbolView } from 'expo-symbols';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileIcon } from '@/components/profile/profile-icons';
import { SectionCard } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import { showAlert } from '@/components/ui/app-alert';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import type { ConfirmedMember, Owner, PendingMember, TeamMember, TeamQuota } from '@/components/team/team-data';
import { ROLE_OPTIONS } from '@/components/team/team-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Barra de cuota bicolor: segmento accent (activos) + ámbar (pendientes) sobre fondo gris. */
export function QuotaCard({
  companyName,
  quota,
  active,
  pending,
}: {
  companyName: string;
  quota: TeamQuota;
  active: number;
  pending: number;
}) {
  const theme = useTheme();
  const free = Math.max(quota.totalSlots - active - pending, 0);
  const activePct = (active / quota.totalSlots) * 100;
  const pendingPct = (pending / quota.totalSlots) * 100;

  return (
    <SectionCard eyebrow="DIRECTORIO CORPORATIVO" title={companyName}>
      <ThemedText type="small" themeColor="textMuted">
        Gestión centralizada de colaboradores y permisos BizAInet
      </ThemedText>

      <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

      <View style={styles.quotaHeaderRow}>
        <View style={styles.quotaHeaderItem}>
          <View style={[styles.dot, { backgroundColor: theme.success }]} />
          <ThemedText type="small" themeColor="textPrimary">
            {active} contacto{active === 1 ? '' : 's'} activo{active === 1 ? '' : 's'}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" themeColor="accent">
          Plan {quota.planLabel}: hasta {quota.totalSlots} cupos
        </ThemedText>
      </View>

      <View
        style={[styles.progressTrack, { backgroundColor: theme.surfaceInset }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: quota.totalSlots, now: active + pending }}
        accessibilityLabel="Cupos del plan ocupados">
        <View style={[styles.progressSegment, { width: `${activePct}%`, backgroundColor: theme.success }]} />
        <View style={[styles.progressSegment, { width: `${pendingPct}%`, backgroundColor: theme.warningAccent }]} />
      </View>

      <View style={styles.quotaFooterRow}>
        <ThemedText type="small" themeColor="textMuted">
          {active} confirmado{active === 1 ? '' : 's'} • {pending} invitación{pending === 1 ? '' : 'es'} pendiente
          {pending === 1 ? '' : 's'}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {free} cupo{free === 1 ? '' : 's'} libre{free === 1 ? '' : 's'}
        </ThemedText>
      </View>
    </SectionCard>
  );
}

type InviteFormValues = { email: string; role: string };

/** Acordeón "Invitar nuevo contacto", ya expandido por defecto. */
export function InviteFormCard({
  disabled,
  disabledReason,
  onInvite,
}: {
  disabled: boolean;
  disabledReason?: string;
  onInvite: (correo: string, rol: 'ADMINISTRADOR' | 'INVITADO') => Promise<void>;
}) {
  const theme = useTheme();
  const { control, handleSubmit, reset } = useForm<InviteFormValues>({ defaultValues: { email: '', role: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onInvite(values.email, values.role as 'ADMINISTRADOR' | 'INVITADO');
      showAlert('Invitación enviada', `Se envió la invitación a ${values.email}.`);
      reset();
    } catch (e) {
      showAlert('No se pudo invitar', (e as Error).message);
    }
  });

  return (
    <SectionCard>
      <View style={styles.inviteHeader}>
        <ProfileIcon name="mail-plus" color={theme.accent} width={16} height={16} />
        <ThemedText type="smallBold" themeColor="textPrimary" style={styles.flex1}>
          Invitar nuevo contacto
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.up', android: 'expand_less', web: 'expand_less' }}
          tintColor={theme.textMuted}
          size={16}
        />
      </View>

      {disabled ? (
        <ThemedText type="small" themeColor="warningText">
          {disabledReason}
        </ThemedText>
      ) : (
        <>
          <FormInput
            control={control}
            name="email"
            label="Ingresa el correo del colaborador"
            placeholder="nombre@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{ required: 'El correo es obligatorio' }}
          />
          <FormSelect
            control={control}
            name="role"
            label="Rol en la organización"
            options={ROLE_OPTIONS}
            placeholder="Selecciona un rol"
            rules={{ required: 'Selecciona un rol' }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar invitación por correo"
            onPress={onSubmit}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}>
            <ThemedText type="smallBold" style={styles.onAccent}>
              Enviar invitación por correo
            </ThemedText>
          </Pressable>
        </>
      )}
    </SectionCard>
  );
}

/**
 * Card del Administrador de referencia. El backend no distingue un "Titular" dedicado — puede
 * haber varios `ADMINISTRADOR` — así que esto muestra el primero como referencia, sin los datos
 * ficticios del mock original (verificación biométrica, firma digital SAT/RUT, móvil verificado:
 * ninguno existe en `GET /companies/:id/members`).
 */
export function OwnerCard({ owner }: { owner: Owner }) {
  const theme = useTheme();

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <ThemedText type="small" style={[styles.eyebrow, { color: theme.eyebrow }]}>
          ADMINISTRADOR
        </ThemedText>
      </View>

      <View style={[styles.ownerCard, { borderColor: theme.success, backgroundColor: theme.surface }]}>
        <View style={[styles.ownerTopBar, { backgroundColor: theme.success }]} />
        <View style={styles.ownerContent}>
          <View style={styles.ownerHeaderRow}>
            <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
              <ProfileIcon name="person" color={theme.accent} width={18} height={18} />
            </View>
            <View style={styles.flex1}>
              <ThemedText type="smallBold" themeColor="textPrimary">
                {owner.name}
              </ThemedText>
              <ThemedText type="small" themeColor="accent">
                {owner.title}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Card de colaborador del equipo: confirmado (acciones mensaje/menú) o pendiente (reenviar/cancelar). */
export function MemberCard({
  member,
  onMessage,
  onResend,
  onCancel,
  onChangeRole,
}: {
  member: TeamMember;
  onMessage?: (m: ConfirmedMember) => void;
  onResend?: (m: PendingMember) => void;
  onCancel?: (m: PendingMember) => void;
  onChangeRole?: (m: ConfirmedMember) => void;
}) {
  const theme = useTheme();

  if (member.status === 'confirmed') {
    return (
      <View style={[styles.memberCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
        <View style={styles.memberHeaderRow}>
          <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
            <ProfileIcon name="person" color={theme.accent} width={16} height={16} />
          </View>
          <View style={styles.flex1}>
            <ThemedText type="smallBold" themeColor="textPrimary">
              {member.name}
            </ThemedText>
            <ThemedText type="small" themeColor="accent">
              {member.role}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Más opciones para ${member.name}`}
            onPress={() => onChangeRole?.(member)}
            hitSlop={Spacing.two}
            style={styles.menuButton}>
            <SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} tintColor={theme.textMuted} size={18} />
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

        <View style={styles.memberFooterRow}>
          <ThemedText type="small" style={[styles.statusLabel, { color: theme.success }]}>
            INVITACIÓN ACEPTADA / ACTIVO
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Enviar mensaje directo a ${member.name}`}
            onPress={() => onMessage?.(member)}
            style={({ pressed }) => [styles.outlineButton, { borderColor: theme.accent, opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText type="small" themeColor="accent">
              Mensaje directo
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.memberCard, { backgroundColor: theme.surface, borderColor: theme.warningBorder }]}>
      <View style={styles.memberHeaderRow}>
        <View style={[styles.avatar, { backgroundColor: theme.warningSoft }]}>
          <ProfileIcon name="mail-plus" color={theme.warningText} width={14} height={14} />
        </View>
        <View style={styles.flex1}>
          <ThemedText type="smallBold" themeColor="textPrimary" numberOfLines={1}>
            {member.email}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            Rol: {member.role}
          </ThemedText>
          <View style={styles.pendingRow}>
            <View style={[styles.dot, { backgroundColor: theme.warningAccent }]} />
            <ThemedText type="small" style={{ color: theme.warningText }}>
              INVITACIÓN ENVIADA - PENDIENTE DE REGISTRO
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

      <View style={styles.pendingActionsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cancelar invitación a ${member.email}`}
          onPress={() => onCancel?.(member)}
          style={({ pressed }) => [styles.textButton, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText type="small" themeColor="error">
            Cancelar
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reenviar invitación a ${member.email}`}
          onPress={() => onResend?.(member)}
          style={({ pressed }) => [styles.primaryButtonSm, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}>
          <ThemedText type="small" style={styles.onAccent}>
            Reenviar invitación
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

/** Card informativa final: BizAInet SafeGuard™. */
export function SafeguardCard() {
  const theme = useTheme();
  return (
    <View style={[styles.safeguardCard, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
      <ProfileIcon name="lock" color={theme.textMuted} width={14} height={18} />
      <ThemedText type="small" themeColor="textMuted" style={styles.flex1}>
        <ThemedText type="smallBold" themeColor="textMuted">
          BizAInet SafeGuard™.{' '}
        </ThemedText>
        Los permisos de cada colaborador quedan limitados a su rol asignado y toda acción sobre
        el equipo queda registrada en la auditoría de la empresa.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  onAccent: { color: '#ffffff' },
  divider: { height: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  quotaHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  quotaHeaderItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  progressTrack: { height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  progressSegment: { height: '100%' },
  quotaFooterRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  inviteHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  primaryButton: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryButtonSm: { height: 40, paddingHorizontal: Spacing.three, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  textButton: { height: 40, paddingHorizontal: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  ownerCard: { borderRadius: 16, borderWidth: 2, overflow: 'hidden' },
  ownerTopBar: { height: 4 },
  ownerContent: { padding: Spacing.three, gap: Spacing.three },
  badgeRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  ownerHeaderRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  memberCard: { borderRadius: 16, borderWidth: 1, padding: Spacing.three, gap: Spacing.three },
  memberHeaderRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  menuButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  memberFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  statusLabel: { fontSize: 11, fontWeight: '700' },
  outlineButton: { height: 36, paddingHorizontal: Spacing.three, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  pendingActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
  safeguardCard: { flexDirection: 'row', gap: Spacing.two, borderRadius: 12, borderWidth: 1, padding: Spacing.three, alignItems: 'flex-start' },
});
