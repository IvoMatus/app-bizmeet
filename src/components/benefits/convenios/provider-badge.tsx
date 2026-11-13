import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProviderBadgeProps = {
  proveedor: string;
  logoUrl?: string;
  /** Segunda línea opcional (etiquetaPartner en el hero del detalle). */
  caption?: string;
};

/** Logo + proveedor sobre la portada. Caja opaca (`navBackground`) para leerse sobre cualquier foto. */
export function ProviderBadge({ proveedor, logoUrl, caption }: ProviderBadgeProps) {
  const theme = useTheme();

  return (
    <View style={[styles.box, { backgroundColor: theme.navBackground }]}>
      <View style={[styles.logo, { backgroundColor: theme.accentSoft }]}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} contentFit="cover" style={styles.logoImage} accessible={false} />
        ) : (
          <ThemedText type="smallBold" style={{ color: theme.accentText, fontSize: 16 }}>
            {proveedor.charAt(0)}
          </ThemedText>
        )}
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold" numberOfLines={1} style={{ color: theme.textPrimary }}>
          {proveedor}
        </ThemedText>
        {caption && (
          <ThemedText type="small" numberOfLines={1} style={[styles.caption, { color: theme.accentText }]}>
            {caption}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.one,
    paddingRight: Spacing.three,
    borderRadius: 12,
    maxWidth: '100%',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  text: {
    flexShrink: 1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});
