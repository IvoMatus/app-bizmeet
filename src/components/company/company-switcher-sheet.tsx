import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, TIPO_LABEL } from '@/components/company/company-card';
import { toCompany } from '@/components/company/company-data';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useTheme } from '@/hooks/use-theme';

type CompanySwitcherSheetProps = { visible: boolean; onClose: () => void };

/**
 * Selector de empresa activa (T2.5). Al elegir una, `useActiveCompany` vuelve a pedir
 * `GET /companies/:id/context` para que el resto de la app recalcule menú y permisos.
 */
export function CompanySwitcherSheet({ visible, onClose }: CompanySwitcherSheetProps) {
  const theme = useTheme();
  const { companies, active, setActiveCompanyId } = useActiveCompany();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.header}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Elegí tu empresa activa
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={onClose}
                style={styles.closeButton}>
                <SymbolView tintColor={theme.textMuted} name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
              {!companies && <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>Cargando tus empresas…</ThemedText>}

              {companies?.length === 0 && (
                <ThemedText style={{ color: theme.textMuted, textAlign: 'center' }}>Todavía no formás parte de ninguna empresa.</ThemedText>
              )}

              {companies?.map((mine) => {
                const company = toCompany(mine);
                const isActive = active?.company.id === company.id;
                // Pago pendiente (T2.3, SKIP_STRIPE=true hoy): solo el titular puede pagar, así
                // que el CTA solo aplica a esa empresa. No confundir con "bloqueada" (otro estado).
                const needsPayment = company.estado === 'PENDIENTE_PAGO' && company.isTitular;
                return (
                  <Pressable
                    key={company.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Activar ${company.name}${isActive ? ', empresa activa' : ''}`}
                    onPress={() => {
                      setActiveCompanyId(company.id);
                      onClose();
                    }}
                    style={[
                      styles.item,
                      { borderColor: isActive ? theme.accent : theme.surfaceBorder, backgroundColor: isActive ? theme.accentSoft : theme.cardElevated },
                    ]}>
                    <View style={styles.itemText}>
                      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                        {company.name}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textMuted }}>
                        {TIPO_LABEL[company.tipo]} · {company.industry}
                      </ThemedText>
                      {needsPayment && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Pagar plan de ${company.name}`}
                          onPress={() => {
                            onClose();
                            router.push(`/empresa/plan?companyId=${company.id}`);
                          }}
                          style={styles.payCta}>
                          <ThemedText type="small" style={{ color: theme.warning }}>
                            Pago pendiente · Pagar plan
                          </ThemedText>
                        </Pressable>
                      )}
                    </View>
                    {isActive ? (
                      <SymbolView
                        tintColor={theme.accent}
                        name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                        size={20}
                      />
                    ) : (
                      <Badge label={company.roleBadge.label} icon={company.roleBadge.icon} bg={theme.buttonDark} fg={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderWidth: 1,
    maxHeight: '80%',
    paddingTop: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    minHeight: 44,
  },
  itemText: {
    flex: 1,
    gap: Spacing.half,
  },
  payCta: {
    paddingVertical: Spacing.half,
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
