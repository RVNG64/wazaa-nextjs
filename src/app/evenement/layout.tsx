import { ReactNode } from 'react';

export const metadata = {
  title: 'Créer un nouvel événement | WAZAA',
  description: "Créez et partagez un nouvel événement avec Wazaa. Organisez des festivals, des concerts, des conférences et bien plus encore.",
  openGraph: {
    title: 'Créer un nouvel événement | WAZAA',
    description: "Créez et partagez un nouvel événement avec Wazaa. Organisez des festivals, des concerts, des conférences et bien plus encore.",
    url: 'https://www.wazaa.app/evenement',
    images: [{ url: '/og-image.png' }],
    siteName: 'WAZAA',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@wazaa_app',
    creator: '@wazaa_app',
    title: 'Créer un nouvel événement | WAZAA',
    description: "Créez et partagez un nouvel événement avec Wazaa. Organisez des festivals, des concerts, des conférences et bien plus encore.",
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
