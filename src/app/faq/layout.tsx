import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'Foire Aux Questions | WAZAA',
    description: "Questions fréquemment posées sur WAZAA. Trouvez des réponses à toutes vos questions concernant l'utilisation de notre plateforme.",
    openGraph: {
      title: 'Foire Aux Questions | WAZAA',
      description: "Questions fréquemment posées sur WAZAA. Trouvez des réponses à toutes vos questions concernant l'utilisation de notre plateforme.",
      url: 'https://www.wazaa.app/faq',
      images: [{ url: '/og-image.png' }],
      siteName: 'WAZAA',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wazaa_app',
      creator: '@wazaa_app',
      title: 'FAQ | WAZAA',
      description: "Questions fréquemment posées sur WAZAA. Trouvez des réponses à toutes vos questions concernant l'utilisation de notre plateforme.",
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
