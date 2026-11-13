import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Step4Success } from '@/components/register/step-4-success';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function Step4Screen() {
  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Step4Success
            // Muro primero y Crear Empresa encima: el "atrás" de Crear Empresa vuelve al Muro, no al registro.
            // ponytail: "Persona Premium" (plan individual) no tiene flujo propio todavía — este CTA lleva a
            // Crear Empresa, que es el único alta de plan pago que existe hoy.
            onUpgrade={() => {
              router.replace('/');
              router.push('/empresa/crear');
            }}
            onContinueBasic={() => router.replace('/')}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.six,
  },
});
