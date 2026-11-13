import { File } from 'expo-file-system';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { showAlert } from '@/components/ui/app-alert';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CompanyDocumentType } from '@/utils/api';

export const DOCUMENT_TYPE_LABEL: Record<CompanyDocumentType, string> = {
  RFC: 'RFC',
  ACTA_CONSTITUTIVA: 'Acta constitutiva',
  CONSTANCIA_SITUACION_FISCAL_EMPRESA: 'Constancia de situación fiscal',
  PODER_REPRESENTANTE_LEGAL: 'Poder del representante legal',
  IDENTIFICACION_REPRESENTANTE: 'Identificación del representante',
};

/** Mismos límites que valida el backend (POST /companies/:id/documents). */
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;

export type PickedDocument = { uri: string; name: string; mimeType: string };
export type KybDocuments = Partial<Record<CompanyDocumentType, PickedDocument>>;

/**
 * Documentos KYB opcionales al crear la empresa: uno por tipo, JPG/PNG/PDF de hasta 10 MB. Se
 * suben después de crear la empresa (el endpoint necesita su id) — ver empresa/crear.tsx.
 * ponytail: todos opcionales y sin depender de la forma jurídica; si producto define cuáles son
 * obligatorios según el tipo de empresa, se filtra `DOCUMENT_TYPE_LABEL` aquí.
 */
export function KybDocumentsField({ value, onChange }: { value: KybDocuments; onChange: (value: KybDocuments) => void }) {
  const theme = useTheme();

  async function pick(tipo: CompanyDocumentType) {
    const picked = await File.pickFileAsync({ mimeTypes: ACCEPTED_MIME_TYPES });
    if (picked.canceled) return;
    const file = picked.result;
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      showAlert('Formato no admitido', 'El documento debe ser JPG, PNG o PDF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      showAlert('Archivo demasiado grande', 'El documento debe pesar 10 MB o menos.');
      return;
    }
    onChange({ ...value, [tipo]: { uri: file.uri, name: file.name, mimeType: file.type } });
  }

  function remove(tipo: CompanyDocumentType) {
    const next = { ...value };
    delete next[tipo];
    onChange(next);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">Documentos de la empresa (opcional)</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        JPG, PNG o PDF de hasta 10 MB. Se revisan para validar la empresa.
      </ThemedText>
      {(Object.keys(DOCUMENT_TYPE_LABEL) as CompanyDocumentType[]).map((tipo) => {
        const doc = value[tipo];
        const label = DOCUMENT_TYPE_LABEL[tipo];
        return (
          <View key={tipo} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.text}>
              <ThemedText type="small" themeColor="textPrimary">
                {label}
              </ThemedText>
              {doc && (
                <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
                  {doc.name}
                </ThemedText>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={doc ? `Quitar ${label}` : `Adjuntar ${label}`}
              hitSlop={Spacing.two}
              onPress={() => (doc ? remove(tipo) : pick(tipo))}>
              <ThemedText type="smallBold" themeColor={doc ? 'error' : 'accentText'}>
                {doc ? 'Quitar' : 'Adjuntar'}
              </ThemedText>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
});
