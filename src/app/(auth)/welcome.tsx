import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';

// ponytail: fuente Plus Jakarta Sans no cargada, se usa system font con el weight equivalente; agregar con expo-font si hace falta pixel-fidelity tipográfica

const GOOGLE_ICON_XML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.83 8.18C15.83 7.71333 15.79 7.24667 15.7033 6.8H8V9.80667H12.4C12.2067 10.82 11.64 11.6867 10.8 12.26V14.2933H13.3867C14.9 12.9 15.83 10.8467 15.83 8.18V8.18" fill="#4285F4"/>
<path d="M8 16C10.16 16 11.9667 15.28 13.2867 14.06L10.7 12.0267C9.98 12.5067 9.06667 12.8 8 12.8C5.92 12.8 4.15333 11.4 3.52 9.51333H0.84V11.6133C2.16667 14.2467 4.88667 16 8 16V16" fill="#34A853"/>
<path d="M3.52 9.51333C3.19336 8.53088 3.19336 7.46912 3.52 6.48667V4.38667H0.84C-0.313564 6.65745 -0.313564 9.34255 0.84 11.6133L3.52 9.51333V9.51333" fill="#FBBC05"/>
<path d="M8 3.16667C9.18 3.16667 10.2333 3.57333 11.0667 4.36667L13.3467 2.08667C11.9667 0.793333 10.16 0 8 0C4.88667 0 2.16667 1.75333 0.84 4.38667L3.52 6.48667C4.15333 4.6 5.92 3.16667 8 3.16667V3.16667" fill="#EA4335"/>
</svg>`;

const KEY_ICON_XML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.75 4.08333C9.3939 4.08333 9.91667 4.6061 9.91667 5.25M12.25 5.25C12.2503 6.35858 11.7254 7.40177 10.835 8.06218C9.94464 8.72259 8.79402 8.92213 7.73325 8.60008L6.41667 9.91667H5.25V11.0833H4.08333V12.25H2.33333C2.01138 12.25 1.75 11.9886 1.75 11.6667V10.1582C1.75003 10.0035 1.81151 9.85512 1.92092 9.74575L5.39992 6.26675C5.0023 4.95228 5.41014 3.52674 6.44282 2.62147C7.47549 1.71621 8.94216 1.49851 10.1933 2.0648C11.4444 2.63109 12.2487 3.87671 12.25 5.25L8.75 4.08333" stroke="#E2E8F0" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ARROW_ICON_XML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.25 2.91667L9.33333 7L5.25 11.0833" stroke="#7DD3FC" stroke-width="1.28333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const BENEFIT_RUBRO_ICON_XML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.66667 6.66667V2L2.66667 9.33333H7.33333V14L13.3333 6.66667H8.66667V6.66667" stroke="#38BDF8" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const BENEFIT_MATCH_ICON_XML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.6667 14V3.33333C12.6667 2.59745 12.0692 2 11.3333 2H4.66667C3.93078 2 3.33333 2.59745 3.33333 3.33333V14M12.6667 14H14M12.6667 14H9.33333M3.33333 14H2M3.33333 14H6.66667M6 4.66667H6.66667M6 7.33333H6.66667M9.33333 4.66667H10M9.33333 7.33333H10M6.66667 14V10.6667C6.66667 10.2987 6.96539 10 7.33333 10H8.66667C9.03461 10 9.33333 10.2987 9.33333 10.6667V14M6.66667 14H9.33333" stroke="#34D399" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const BENEFIT_EVENTOS_ICON_XML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.33333 4.66667V2M10.6667 4.66667V2M4.66667 7.33333H11.3333M3.33333 14H12.6667C13.4026 14 14 13.4026 14 12.6667V4.66667C14 3.93078 13.4026 3.33333 12.6667 3.33333H3.33333C2.59745 3.33333 2 3.93078 2 4.66667V12.6667C2 13.4026 2.59745 14 3.33333 14L5.33333 4.66667" stroke="#FBBF24" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const BENEFIT_ALIANZAS_ICON_XML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 2.90267C8.73361 2.07097 9.9054 1.78013 10.9428 2.17227C11.9801 2.56441 12.6665 3.55765 12.6665 4.66667C12.6665 5.77568 11.9801 6.76893 10.9428 7.16107C9.9054 7.5532 8.73361 7.26237 8 6.43067M10 14H2V13.3333C2 11.1257 3.79234 9.33333 6 9.33333C8.20766 9.33333 10 11.1257 10 13.3333V14L8 2.90267M8 2.90267H12V2.236C12.0002 0.806837 11.2379 -0.513856 10.0002 -1.22853C8.7626 -1.94319 7.23769 -1.94325 6 -1.22867M8.66667 4.66667C8.66667 6.13844 7.47177 7.33333 6 7.33333C4.52823 7.33333 3.33333 6.13844 3.33333 4.66667C3.33333 3.19489 4.52823 2 6 2C7.47177 2 8.66667 3.19489 8.66667 4.66667L8 2.90267" stroke="#D8B4FE" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/welcome-background.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(2,6,23,0.6)', 'rgba(2,6,23,0)']}
        style={styles.topGradient}
      />
      <LinearGradient
        colors={['rgba(2,6,23,0)', 'rgba(2,6,23,0.4)', '#020617']}
        style={styles.bottomGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoCard}>
            <Image
              source={require('../../../assets/images/welcome-logo.jpg')}
              style={styles.logoImage}
              contentFit="cover"
            />
          </View>
        </View>

        {/* ponytail: fondo del panel simplificado a un gradiente de 2 stops en vez de replicar el intermedio exacto del Figma */}
        <LinearGradient
          colors={['rgba(15,23,42,0.88)', 'rgba(10,17,32,0.97)']}
          style={styles.panel}>
          <View style={styles.dragHandle} />

          <ThemedText style={styles.title}>Acceso al Ecosistema</ThemedText>
          <ThemedText style={styles.subtitle}>
            Conecta, colabora y expande tus oportunidades
          </ThemedText>

          <Pressable
            style={styles.googleButton}
            onPress={() => {
              // TODO: wire real Google OAuth (Clerk) cuando esté disponible
              router.push('/(auth)/login');
            }}>
            <SvgXml xml={GOOGLE_ICON_XML} width={16} height={16} />
            <ThemedText style={styles.googleButtonLabel}>Continuar con Google</ThemedText>
          </Pressable>

          <Pressable
            style={styles.generalButton}
            onPress={() => router.push('/(auth)/register/step-1')}>
            <View style={styles.generalButtonLeft}>
              <View style={styles.keyChip}>
                <SvgXml xml={KEY_ICON_XML} width={14} height={14} />
              </View>
              <ThemedText style={styles.generalButtonLabel}>
                Continuar con acceso general
              </ThemedText>
            </View>
            <View style={styles.arrowChip}>
              <SvgXml xml={ARROW_ICON_XML} width={14} height={14} />
            </View>
          </Pressable>

          <View style={styles.benefitsRow}>
            <View style={styles.benefitColumn}>
              <View style={[styles.benefitChip, styles.benefitChipRubro]}>
                <SvgXml xml={BENEFIT_RUBRO_ICON_XML} width={16} height={16} />
              </View>
              <ThemedText style={styles.benefitLabel}>Prioridad por{'\n'}Rubro</ThemedText>
            </View>
            <View style={styles.benefitColumn}>
              <View style={[styles.benefitChip, styles.benefitChipMatch]}>
                <SvgXml xml={BENEFIT_MATCH_ICON_XML} width={16} height={16} />
              </View>
              <ThemedText style={styles.benefitLabel}>Match con IA</ThemedText>
            </View>
            <View style={styles.benefitColumn}>
              <View style={[styles.benefitChip, styles.benefitChipEventos]}>
                <SvgXml xml={BENEFIT_EVENTOS_ICON_XML} width={16} height={16} />
              </View>
              <ThemedText style={styles.benefitLabel}>Eventos VIP</ThemedText>
            </View>
            <View style={styles.benefitColumn}>
              <View style={[styles.benefitChip, styles.benefitChipAlianzas]}>
                <SvgXml xml={BENEFIT_ALIANZAS_ICON_XML} width={16} height={16} />
              </View>
              <ThemedText style={styles.benefitLabel}>Alianzas</ThemedText>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Términos y Privacidad</ThemedText>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 112,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoCard: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    // ponytail: sin blur real (evita expo-blur), la superposición semi-opaca ya logra el efecto visual buscado
  },
  logoImage: {
    flex: 1,
    borderRadius: 16,
  },
  panel: {
    width: '100%',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingTop: 13,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(203,213,225,0.8)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  generalButton: {
    marginTop: 10,
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generalButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  keyChip: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  arrowChip: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(14,165,233,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsRow: {
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  benefitColumn: {
    flex: 1,
    alignItems: 'center',
  },
  benefitChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  benefitChipRubro: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  benefitChipMatch: {
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.3)',
  },
  benefitChipEventos: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
  },
  benefitChipAlianzas: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.3)',
  },
  benefitLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#e2e8f0',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 7,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
});
