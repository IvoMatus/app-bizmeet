import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import { CheckoutFooter } from '@/components/benefits/eventos/checkout-footer';
import { DetailCard } from '@/components/benefits/shared/detail-card';
import { DetailList } from '@/components/benefits/shared/detail-list';
import { EventoHero } from '@/components/benefits/eventos/evento-hero';
import { eventoPorId, fechaCorta, horaLabel } from '@/components/benefits/eventos/eventos-data';
import { HighlightedTitle } from '@/components/ui/highlighted-title';
import { ShareButton } from '@/components/benefits/shared/share-button';
import { TicketSelector } from '@/components/benefits/eventos/ticket-option';
import { DetailHeader } from '@/components/navigation/detail-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { showAlert } from '@/components/ui/app-alert';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function EventoDetalleScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const evento = eventoPorId(id);
  // Arranca en la entrada "popular" (beneficio de socio), si hay; si no, la primera.
  const [entradaId, setEntradaId] = useState(() => (evento?.entradas.find((e) => e.popular) ?? evento?.entradas[0])?.id ?? '');
  const entrada = evento?.entradas.find((e) => e.id === entradaId);

  if (!evento || !entrada) {
    return (
      <ThemedView type="screenBackground" style={styles.flex}>
        <SafeAreaView edges={['top']} style={styles.flex}>
          <DetailHeader title="Detalle Evento" />
          <ThemedText style={[styles.message, { color: theme.textMuted }]}>Este evento ya no está disponible.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Mock: sin pago real, sin QR y sin paso 2 (Fase 2: Zoom, QR y Stripe).
  const confirmar = () =>
    showAlert('¡Asistencia confirmada!', `Reservaste "${entrada.nombre}" para ${evento.titulo}. Te enviaremos la acreditación por correo.`, [
      { text: 'Listo', onPress: () => router.back() },
    ]);

  return (
    <ThemedView type="screenBackground" style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <DetailHeader title="Detalle Evento" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <BenefitPill
              label={evento.categoria}
              bg={theme.successSurface}
              fg={theme.textPrimary}
              iconColor={theme.success}
              icon={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
            />
            <ShareButton label="Compartir evento" message={`${evento.titulo} — ${evento.lugar}, ${fechaCorta(evento.fecha)}. Evento de la red BizAInet.`} />
          </View>

          <EventoHero evento={evento} />

          <View style={styles.intro}>
            <ThemedText type="smallBold" style={[styles.sector, { color: theme.eyebrow }]}>
              {evento.sector}
            </ThemedText>
            <HighlightedTitle type="h2" text={evento.titulo} highlight={evento.tituloResaltado} />
            <View style={styles.meta}>
              <SymbolView tintColor={theme.accentText} name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={14} />
              <ThemedText type="small" style={[styles.flex, { color: theme.textMuted }]}>
                {evento.lugar} • {horaLabel(evento.fecha)} • {evento.formato}
              </ThemedText>
            </View>
          </View>

          <DetailCard>
            <ThemedText type="body" style={{ color: theme.textMuted }}>
              {evento.descripcion}
            </ThemedText>
          </DetailCard>

          <DetailCard title="Logística & Beneficios Ejecutivos" icon={{ ios: 'star.circle', android: 'stars', web: 'stars' }}>
            <DetailList marker="icon" items={evento.beneficios} />
          </DetailCard>

          <TicketSelector entradas={evento.entradas} selectedId={entrada.id} onSelect={setEntradaId} />
          <CheckoutFooter total={entrada.precio} onConfirm={confirmar} />
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
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  intro: {
    gap: Spacing.two,
  },
  sector: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
});
