import { ReactNode } from 'react';

export const metadata = {
  title: 'Inscription Entreprise | WAZAA',
  description: "Inscrivez votre entreprise sur Wazaa pour organiser et promouvoir des événements près de chez vous.",
  keywords: 'événements, inscription, entreprise, organiser, Wazaa, Bordeaux, Gironde, Sud-Ouest, France, Pays Basque, Landes, Pyrénées-Atlantiques',
  openGraph: {
    title: 'Inscription Entreprise | WAZAA',
    description: "Inscrivez votre entreprise sur Wazaa pour organiser et promouvoir des événements près de chez vous.",
    url: 'https://www.wazaa.app/inscription-pro',
    images: [{ url: '/og-image.png' }],
    siteName: 'WAZAA',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wazaa_app',
    creator: '@wazaa_app',
    title: 'Inscription Entreprise | WAZAA',
    description: "Inscrivez votre entreprise sur Wazaa pour organiser et promouvoir des événements près de chez vous.",
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
