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
            // Muro primero (anchor) y Crear Empresa encima, en el Stack de Inicio: el "atrás" vuelve al
            // Muro, no al registro. Una sola navegación con el grupo explícito: antes era replace('/') +
            // push('/empresa/crear') en el mismo tick — el push se resolvía con los segmentos de (auth)
            // y caía en (company) (desempate alfabético de la ruta compartida) sin Mis Empresas debajo;
            // el "atrás" saltaba al Muro y Crear Empresa quedaba solo en el Stack de Empresa: tocar esa
            // pestaña después abría el formulario.
            // ponytail: "Persona Premium" (plan individual) no tiene flujo propio todavía — este CTA lleva a
            // Crear Empresa, que es el único alta de plan pago que existe hoy.
            onUpgrade={() => router.replace('/(tabs)/(home)/empresa/crear', { withAnchor: true })}
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
