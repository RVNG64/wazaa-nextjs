import { ReactNode } from 'react';

export async function generateMetadata() {
  return {
    title: 'Mentions Légales | WAZAA',
    description: "Consultez les mentions légales du site WAZAA. Informations sur la propriété intellectuelle, les limitations de responsabilité, et les données personnelles.",
    openGraph: {
      title: 'Mentions Légales | WAZAA',
      description: "Consultez les mentions légales du site WAZAA. Informations sur la propriété intellectuelle, les limitations de responsabilité, et les données personnelles.",
      url: 'https://www.wazaa.app/mentions-legales',
      images: [{ url: '/og-image.png' }],
      siteName: 'WAZAA',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@wazaa_app',
      creator: '@wazaa_app',
      title: 'Mentions Légales | WAZAA',
      description: "Consultez les mentions légales du site WAZAA. Informations sur la propriété intellectuelle, les limitations de responsabilité, et les données personnelles.",
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
