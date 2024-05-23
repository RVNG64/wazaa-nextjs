import { ReactNode } from 'react';

export const metadata = {
  title: 'Choix d\'inscription | WAZAA',
  description: "Choisissez le type de compte que vous souhaitez créer sur Wazaa et accédez à une multitude d'événements près de chez vous.",
  keywords: 'événements, inscription, loisirs, culture, musique, tourisme, Wazaa, Bordeaux, Gironde, Sud-Ouest, France, Pays Basque, Landes, Pyrénées-Atlantiques',
  openGraph: {
    title: 'Choix d\'inscription | WAZAA',
    description: "Choisissez le type de compte que vous souhaitez créer sur Wazaa et accédez à une multitude d'événements près de chez vous.",
    url: 'https://www.wazaa.app/sign-up-choice',
    images: [{ url: '/og-image.png' }],
    siteName: 'WAZAA',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wazaa_app',
    creator: '@wazaa_app',
    title: 'Choix d\'inscription | WAZAA',
    description: "Choisissez le type de compte que vous souhaitez créer sur Wazaa et accédez à une multitude d'événements près de chez vous.",
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
