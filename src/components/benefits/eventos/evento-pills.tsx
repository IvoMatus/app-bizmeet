import { BenefitPill } from '@/components/benefits/shared/benefit-pill';
import type { Evento } from '@/components/benefits/eventos/eventos-data';
import { useTheme } from '@/hooks/use-theme';

/** Pills de modalidad y acceso. `onImage`: fondo opaco para ir sobre la foto de la card destacada. */
export function EventoPills({ evento, onImage }: { evento: Evento; onImage?: boolean }) {
  const theme = useTheme();
  const presencial = evento.modalidad === 'PRESENCIAL';
  const pago = evento.acceso === 'PAGO';

  return (
    <>
      <BenefitPill
        label={evento.modalidadLabel}
        bg={onImage ? theme.surface : theme.accentSoft}
        fg={onImage ? theme.textPrimary : theme.accentText}
        iconColor={theme.accentText}
        icon={
          presencial
            ? { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }
            : { ios: 'video.fill', android: 'videocam', web: 'videocam' }
        }
      />
      <BenefitPill
        label={evento.accesoLabel}
        bg={onImage ? theme.surface : pago ? theme.surfaceInset : theme.successSurface}
        fg={theme.textPrimary}
        iconColor={pago ? theme.textMuted : theme.success}
        icon={
          pago
            ? { ios: 'banknote.fill', android: 'payments', web: 'payments' }
            : { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }
        }
      />
    </>
  );
}
