import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'Création d\'événement | WAZAA',
    description: "Créez un événement et partagez-le avec le monde grâce à Wazaa. Organisez des festivals, des concerts, des conférences et bien plus encore.",
    openGraph: {
      title: 'Création d\'événement | WAZAA',
      description: "Créez un événement et partagez-le avec le monde grâce à Wazaa. Organisez des festivals, des concerts, des conférences et bien plus encore.",
      url: 'https://www.wazaa.app/creation-evenement',
      images: [{ url: '/og-image.png' }],
      siteName: 'WAZAA',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wazaa_app',
      creator: '@wazaa_app',
      title: 'Création d\'événement | WAZAA',
      description: "Créez un événement et partagez-le avec le monde grâce à Wazaa. Organisez des festivals, des concerts, des conférences et bien plus encore.",
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
