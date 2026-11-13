import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';

import { revelar } from '@/components/benefits/convenios/convenios-data';
import { showAlert } from '@/components/ui/app-alert';
import { useActiveCompany } from '@/hooks/use-active-company';
import { useAuthToken } from '@/hooks/use-auth-token';
import type { Convenio, RevelarConvenioResult } from '@/utils/api';

/**
 * POST /revelar una sola vez por pantalla (registra un uso en la API) y después reusa el
 * resultado. CODIGO: deja el código en `secreto` para mostrarlo/copiarlo. ENLACE: además abre el
 * enlace, cada vez que se llama.
 */
export function useRevelarConvenio(convenio: Convenio | null) {
  const getToken = useAuthToken();
  const { active } = useActiveCompany();
  const [secreto, setSecreto] = useState<RevelarConvenioResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function usar() {
    if (!convenio || loading) return;
    setLoading(true);
    try {
      let result = secreto;
      if (!result) {
        const token = await getToken();
        if (!token) throw new Error('No se pudo obtener la sesión.');
        result = await revelar(convenio, token, active?.company.id);
        setSecreto(result);
      }
      if (convenio.accion === 'ENLACE') {
        if (!result.enlace) throw new Error('El convenio no tiene un enlace disponible.');
        await openBrowserAsync(result.enlace);
      } else if (!result.codigo) {
        throw new Error('El convenio no tiene un código disponible.');
      }
    } catch (e) {
      showAlert('No se pudo canjear', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return { secreto, loading, usar };
}
