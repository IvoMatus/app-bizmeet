import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ConveniosSection } from '@/components/benefits/convenios/convenios-section';
import { EventosSection } from '@/components/benefits/eventos/eventos-section';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Segmento = 'convenios' | 'eventos';

export default function BeneficiosScreen() {
  const theme = useTheme();
  const [segmento, setSegmento] = useState<Segmento>('convenios');
  const tint = (value: Segmento) => (segmento === value ? theme.onButtonDark : theme.textMuted);

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <View style={styles.selector}>
        <SegmentedControl
          accessibilityLabel="Sección de Beneficios"
          value={segmento}
          onChange={setSegmento}
          activeBackgroundColor={theme.buttonDark}
          options={[
            {
              value: 'convenios',
              label: 'Convenios',
              icon: <SymbolView tintColor={tint('convenios')} name={{ ios: 'tag', android: 'sell', web: 'sell' }} size={16} />,
            },
            {
              value: 'eventos',
              label: 'Eventos',
              icon: <SymbolView tintColor={tint('eventos')} name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={16} />,
            },
          ]}
        />
      </View>
      {segmento === 'convenios' ? <ConveniosSection /> : <EventosSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  selector: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});
