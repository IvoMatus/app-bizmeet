import type { ImageSourcePropType } from 'react-native';

import type { CompanyIconName } from '@/components/company/company-icons';

// Mock tipado de "Mis Empresas" (Figma "Mis Empresas - Listado Corporativo").

export type Company = {
  id: string;
  name: string;
  logoUri: ImageSourcePropType;
  /** Solo las empresas donde el usuario es titular muestran el puntaje de verificación IA. */
  verifiedScore?: string;
  roleBadge: { label: string; icon: CompanyIconName };
  /** Badge adicional "Empresa Invitada" — solo cuando el usuario no es titular. */
  invitedBadge?: string;
  description: string;
  offerValue: string;
  seekLabel: string;
  seekValue: string;
  seekIcon: CompanyIconName;
  contactAvatars: ImageSourcePropType[];
  contactsLabel: string;
  contactsIcon: CompanyIconName;
  /** Solo el titular puede editar la empresa o gestionar su equipo. */
  isTitular: boolean;
};

// ponytail: datos mock hasta que exista GET /companies en api-bizmeet; reemplazar por fetch real cuando el endpoint exista
export const MOCK_COMPANIES: Company[] = [
  {
    id: 'horizonte-tecnologico',
    name: 'Horizonte Tecnológico S.A.S.',
    logoUri: require('../../../assets/figma/company/empresas/card1-logo.png'),
    verifiedScore: 'Verificado IA 99.8%',
    roleBadge: { label: 'Titular · Admin', icon: 'titular-badge' },
    description:
      'Desarrollo de infraestructura cloud neural y plataformas fintech escalables para corporaciones multinacionales.',
    offerValue: '6 servicios/productos',
    seekLabel: 'Buscamos:',
    seekValue: '4 servicios/productos',
    seekIcon: 'search',
    contactAvatars: [
      require('../../../assets/figma/company/empresas/card1-contact1.png'),
      require('../../../assets/figma/company/empresas/card1-contact2.png'),
      require('../../../assets/figma/company/empresas/card1-contact3.png'),
    ],
    contactsLabel: '5 inscritos',
    contactsIcon: 'contacts',
    isTitular: true,
  },
  {
    id: 'inversiones-mineria-norte',
    name: 'Inversiones & Minería del Norte SpA',
    logoUri: require('../../../assets/figma/company/empresas/card2-logo.png'),
    roleBadge: { label: 'Rol: Asesor Comercial', icon: 'role-badge' },
    invitedBadge: 'Empresa Invitada',
    description: 'Provisión de suministros pesados, automatización de plantas y logística sustentable para minería de cobre.',
    offerValue: '8 servicios/productos',
    seekLabel: 'Buscamos:',
    seekValue: '3 requerimientos activos',
    seekIcon: 'requirements',
    contactAvatars: [
      require('../../../assets/figma/company/empresas/card2-contact1.png'),
      require('../../../assets/figma/company/empresas/card2-contact2.png'),
    ],
    contactsLabel: '12 personas',
    contactsIcon: 'contacts-alt',
    isTitular: false,
  },
];
