import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'Mes Événements Favoris | WAZAA',
    description: "Découvrez vos événements favoris et obtenez des recommandations personnalisées grâce à WAZAA.",
    openGraph: {
      title: 'Mes Événements Favoris | WAZAA',
      description: "Découvrez vos événements favoris et obtenez des recommandations personnalisées grâce à WAZAA.",
      url: 'https://www.wazaa.app/mes-evenements',
      images: [{ url: '/og-image.png' }],
      siteName: 'WAZAA',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wazaa_app',
      creator: '@wazaa_app',
      title: 'Mes Événements Favoris | WAZAA',
      description: "Découvrez vos événements favoris et obtenez des recommandations personnalisées grâce à WAZAA.",
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
