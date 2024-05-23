import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'Connexion | WAZAA',
    description: "Plongez dans un univers d'événements près de chez vous avec Wazaa ! Connectez-vous dès maintenant pour profiter de toutes les fonctionnalités.",
    openGraph: {
      title: "WAZAA - un monde d'événements autour de vous",
      description: "Plongez dans un univers d'événements près de chez vous avec Wazaa ! Connectez-vous dès maintenant pour profiter de toutes les fonctionnalités.",
      url: 'https://www.wazaa.app/connexion',
      images: [{ url: '/og-image.png' }],
      siteName: 'WAZAA',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wazaa_app',
      creator: '@wazaa_app',
      title: "WAZAA - un monde d'événements autour de vous",
      description: "Plongez dans un univers d'événements près de chez vous avec Wazaa ! Connectez-vous dès maintenant pour profiter de toutes les fonctionnalités.",
      images: ['/og-image.png'],
    },
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
};
