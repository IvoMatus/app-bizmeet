import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { SectionCard, StatusPill } from '@/components/profile/profile-primitives';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/ui/themed-text-input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GalleryPhoto } from '@/utils/company-api';

const BUILDING_SYMBOL = { ios: 'building.2', android: 'business', web: 'business' } as const;

/** Pastilla "✓ Guardar" del header de Editar Empresa (mismo handler que el botón del footer). */
export function HeaderSaveButton({ onPress, disabled, loading }: { onPress: () => void; disabled?: boolean; loading?: boolean }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Guardar"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.headerPill,
        { backgroundColor: theme.accent, opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={theme.background} />
      ) : (
        <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.background} size={12} />
      )}
      <ThemedText style={[styles.buttonLabel, { color: theme.background }]}>Guardar</ThemedText>
    </Pressable>
  );
}

/** Card "Logotipo Oficial": preview de 52px y subida inmediata. Sin borrar: el backend no tiene ese endpoint. */
export function LogoCard({ logoUrl, uploading, onUpload }: { logoUrl: string | null; uploading: boolean; onUpload: () => void }) {
  const theme = useTheme();

  return (
    <SectionCard>
      <View style={styles.logoHeader}>
        <View style={styles.flex}>
          <ThemedText accessibilityRole="header" style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Logotipo Oficial
          </ThemedText>
          <ThemedText style={[styles.helper, { color: theme.textMuted }]}>PNG o JPG (máx. 5MB)</ThemedText>
        </View>
        <StatusPill label="Recomendado 512×512" variant="accent" />
      </View>
      <View style={[styles.logoBox, { backgroundColor: theme.surfaceInset, borderColor: theme.surfaceBorder }]}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} accessibilityLabel="Logotipo actual" style={styles.logo} contentFit="cover" />
        ) : (
          <View style={[styles.logo, styles.center, { backgroundColor: theme.accentSoft }]}>
            <SymbolView name={BUILDING_SYMBOL} tintColor={theme.accent} size={20} />
          </View>
        )}
        <View style={[styles.flex, styles.logoActions]}>
          <ThemedText style={[styles.fieldLabel, { color: theme.textPrimary }]}>
            {logoUrl ? 'Logotipo actual' : 'Sin logotipo'}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: uploading, busy: uploading }}
            disabled={uploading}
            onPress={onUpload}
            style={({ pressed }) => [
              styles.uploadButton,
              { backgroundColor: theme.accent, opacity: uploading ? 0.5 : pressed ? 0.85 : 1 },
            ]}>
            {uploading ? (
              <ActivityIndicator size="small" color={theme.background} />
            ) : (
              <SymbolView name={{ ios: 'square.and.arrow.up', android: 'upload', web: 'upload' }} tintColor={theme.background} size={12} />
            )}
            <ThemedText style={[styles.buttonLabel, { color: theme.background }]}>Subir nueva imagen</ThemedText>
          </Pressable>
        </View>
      </View>
    </SectionCard>
  );
}

/**
 * Lista editable de chips (¿Qué ofrecemos? / ¿Qué buscamos?): tocar un chip lo quita; el campo punteado
 * agrega uno nuevo con el botón "Agregar" o la tecla de enviar. Mismos límites que el PATCH: ≤`max`
 * ítems de ≤80 caracteres, sin vacíos. Los repetidos (sin distinguir mayúsculas) se ignoran.
 */
export function TagListField({
  items,
  onChange,
  max,
  addLabel,
  colors,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  addLabel: string;
  colors: { bg: string; border: string; fg: string };
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const text = draft.trim();

  function add() {
    if (text && !items.some((i) => i.toLowerCase() === text.toLowerCase())) onChange([...items, text]);
    setDraft('');
  }

  return (
    <View style={styles.tagList}>
      {items.length > 0 && (
        <View style={styles.chips}>
          {items.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${item}`}
              hitSlop={{ top: 8, bottom: 8 }}
              onPress={() => onChange(items.filter((i) => i !== item))}
              style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <ThemedText style={[styles.chipLabel, { color: colors.fg }]}>{item}</ThemedText>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={colors.fg} size={10} />
            </Pressable>
          ))}
        </View>
      )}
      {items.length < max && (
        <View style={[styles.dashed, styles.addRow, { borderColor: theme.accent }]}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.accent} size={14} />
          <ThemedTextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={add}
            submitBehavior="submit"
            returnKeyType="done"
            maxLength={80}
            placeholder={addLabel}
            placeholderTextColor={theme.accentText}
            accessibilityLabel={addLabel}
            style={[styles.addInput, { color: theme.textPrimary }]}
          />
          {text !== '' && (
            <Pressable accessibilityRole="button" accessibilityLabel={`Agregar ${text}`} onPress={add} style={styles.addButton}>
              <ThemedText style={[styles.buttonLabel, { color: theme.accentText }]}>Agregar</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

/** Galería de Referencia: grilla de 2 columnas con tacho por foto y celda punteada para subir otra. */
export function GalleryGrid({
  fotos,
  max,
  uploading,
  onAdd,
  onRemove,
}: {
  fotos: GalleryPhoto[];
  max: number;
  uploading: boolean;
  onAdd: () => void;
  onRemove: (foto: GalleryPhoto) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {fotos.map((foto, index) => (
        <View key={foto.id} style={[styles.cell, { backgroundColor: theme.surfaceInset }]}>
          <Image source={{ uri: foto.url }} accessibilityLabel={`Foto ${index + 1} de la galería`} style={styles.fill} contentFit="cover" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar foto ${index + 1}`}
            hitSlop={6}
            onPress={() => onRemove(foto)}
            style={[styles.trash, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} tintColor={theme.error} size={14} />
          </Pressable>
        </View>
      ))}
      {fotos.length < max && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Subir foto"
          accessibilityState={{ disabled: uploading, busy: uploading }}
          disabled={uploading}
          onPress={onAdd}
          style={[styles.cell, styles.dashed, styles.center, { borderColor: theme.accent, backgroundColor: theme.surfaceInset }]}>
          {uploading ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={theme.accent} size={18} />
          )}
          <ThemedText style={[styles.buttonLabel, { color: theme.accentText }]}>Subir foto</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 32,
    paddingHorizontal: Spacing.two + Spacing.half,
    borderRadius: 9999,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  logoActions: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
  },
  tagList: {
    gap: Spacing.two + Spacing.half,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    minHeight: 32,
    paddingHorizontal: Spacing.two + Spacing.half,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  dashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  addInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: Spacing.two,
  },
  addButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
  },
  cell: {
    width: '48.5%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    gap: Spacing.one,
  },
  trash: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
