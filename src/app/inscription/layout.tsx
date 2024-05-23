import { ReactNode } from 'react';

export const metadata = {
  title: 'Inscription | WAZAA',
  description: "Plongez dans un univers d'événements près de chez vous avec Wazaa ! Inscrivez-vous dès maintenant pour profiter de toutes les fonctionnalités.",
  keywords: 'événements, inscription, loisirs, culture, musique, tourisme, Wazaa, Bordeaux, Gironde, Sud-Ouest, France, Pays Basque, Landes, Pyrénées-Atlantiques',
  openGraph: {
    title: 'Inscription | WAZAA',
    description: "Plongez dans un univers d'événements près de chez vous avec Wazaa ! Inscrivez-vous dès maintenant pour profiter de toutes les fonctionnalités.",
    url: 'https://www.wazaa.app/inscription',
    images: [{ url: '/og-image.png' }],
    siteName: 'WAZAA',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wazaa_app',
    creator: '@wazaa_app',
    title: 'Inscription | WAZAA',
    description: "Plongez dans un univers d'événements près de chez vous avec Wazaa ! Inscrivez-vous dès maintenant pour profiter de toutes les fonctionnalités.",
    images: ['/og-image.png'],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
};
