import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { POST_TYPE_CHIPS } from '@/components/post/post-data';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Rubro } from '@/utils/api';

export type AppliedFilters = { query: string; typeKeys: string[]; industries: string[] };

export const EMPTY_FILTERS: AppliedFilters = { query: '', typeKeys: [], industries: [] };

type PostFiltersSheetProps = {
  visible: boolean;
  initial: AppliedFilters;
  /** Catálogo SCIAN (PA-10) — `null` mientras carga. `AppliedFilters.industries` guarda códigos. */
  industries: Rubro[] | null;
  onApply: (filters: AppliedFilters) => void;
  onClose: () => void;
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Bottom sheet "Filtros Avanzados" (versión simplificada: texto + tipo + rubro, sin rango
 * de fecha). Complementa al selector rápido de pills del header del muro, no lo reemplaza.
 */
export function PostFiltersSheet({ visible, initial, industries, onApply, onClose }: PostFiltersSheetProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<AppliedFilters>(initial);

  const activeCount = draft.typeKeys.length + draft.industries.length + (draft.query ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.header}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Filtros Avanzados
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar filtros"
                onPress={onClose}
                style={styles.closeButton}>
                <SymbolView tintColor={theme.textMuted} name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
              <ThemedTextInput
                value={draft.query}
                onChangeText={(query) => setDraft((d) => ({ ...d, query }))}
                placeholder="Buscar por palabra clave"
                placeholderTextColor={theme.textMuted}
                accessibilityLabel="Buscar por palabra clave"
                style={[styles.input, { borderColor: theme.surfaceBorder, color: theme.textPrimary }]}
              />

              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Tipo de publicación
              </ThemedText>
              <View style={styles.chipsRow}>
                {POST_TYPE_CHIPS.map((chip) => {
                  const active = draft.typeKeys.includes(chip.key);
                  return (
                    <Pressable
                      key={chip.key}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={chip.label}
                      onPress={() => setDraft((d) => ({ ...d, typeKeys: toggle(d.typeKeys, chip.key) }))}
                      style={[
                        styles.chip,
                        { backgroundColor: active ? theme.accentSoft : theme.surfaceInset, borderColor: active ? theme.accent : theme.surfaceBorder },
                      ]}>
                      <ThemedText type="small" style={{ color: active ? theme.accent : theme.textMuted }}>
                        {chip.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Rubro
              </ThemedText>
              <View style={styles.chipsRow}>
                {!industries && <ThemedText type="small" style={{ color: theme.textMuted }}>Cargando catálogo de rubros…</ThemedText>}
                {industries?.map((industry) => {
                  const active = draft.industries.includes(industry.codigo);
                  return (
                    <Pressable
                      key={industry.codigo}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={industry.nombre}
                      onPress={() => setDraft((d) => ({ ...d, industries: toggle(d.industries, industry.codigo) }))}
                      style={[
                        styles.chip,
                        { backgroundColor: active ? theme.accentSoft : theme.surfaceInset, borderColor: active ? theme.accent : theme.surfaceBorder },
                      ]}>
                      <ThemedText type="small" style={{ color: active ? theme.accent : theme.textMuted }}>
                        {industry.nombre}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpiar filtros"
                onPress={() => setDraft(EMPTY_FILTERS)}
                style={[styles.footerButton, { backgroundColor: theme.surfaceInset }]}>
                <ThemedText type="smallBold" style={{ color: theme.textMuted }}>
                  Limpiar filtros
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Aplicar filtros (${activeCount} activos)`}
                onPress={() => onApply(draft)}
                style={[styles.footerButton, { backgroundColor: theme.accent }]}>
                <ThemedText type="smallBold" style={{ color: theme.screenBackground }}>
                  Aplicar Filtros ({activeCount})
                </ThemedText>
              </Pressable>
            </View>
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
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footerButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
});
