// src/app/qui-sommes-nous/layout.tsx
import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'À propos de nous | WAZAA',
    description: "Découvrez comment Wazaa transforme la découverte d'événements locaux grâce à une plateforme centralisée et des fonctionnalités innovantes.",
    openGraph: {
      title: 'À propos de nous | WAZAA',
      description: "Découvrez comment Wazaa transforme la découverte d'événements locaux grâce à une plateforme centralisée et des fonctionnalités innovantes.",
      url: 'https://www.wazaa.app/qui-sommes-nous',
      images: [{ url: '/og-image.png' }],
      siteName: 'WAZAA',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wazaa_app',
      creator: '@wazaa_app',
      title: 'À propos de nous | WAZAA',
      description: "Découvrez comment Wazaa transforme la découverte d'événements locaux grâce à une plateforme centralisée et des fonctionnalités innovantes.",
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
}
