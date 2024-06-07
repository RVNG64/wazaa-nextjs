import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'Connexion | WAZAA',
    description: "Découvrez des événements près de chez vous ! Explorez des expériences uniques, musicales, culturelles et touristiques avec Wazaa !",
    openGraph: {
      title: "WAZAA - un monde d'événements autour de vous",
      description: "Découvrez des événements près de chez vous ! Explorez des expériences uniques, musicales, culturelles et touristiques avec Wazaa !",
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
      description: "Découvrez des événements près de chez vous ! Explorez des expériences uniques, musicales, culturelles et touristiques avec Wazaa !",
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
