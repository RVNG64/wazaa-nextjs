/* eslint-disable react/no-unescaped-entities */
// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import LayoutClient from "./LayoutClient";
// import { Sora, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/app.css";
import "../styles/popupArrival.css";
import '../styles/navbar.css';
import '../styles/footer.css';
import '../styles/mobileMenu.css'
import '../styles/scrollToTopButton.css'
import '../styles/sideMenu.css'
import '../styles/listToggleView.css'
import '../styles/listView.css'
import '../styles/eventDetails.css'
import '../styles/contactPopup.css'
import '../styles/loginRequiredPopup.css'
import '../styles/signUpChoice.css';
import '../styles/signUp.css';
import '../styles/signUpOrganizer.css';
import '../styles/signInChoice.css';
import '../styles/signIn.css';
import '../styles/advancedSearch.css';
import '../styles/eventCreation.css';
import '../styles/apropos.css';
import '../styles/attendanceEventsAdmin.css';
import '../styles/dateDisplay.css';
import '../styles/eventCard.css';
import '../styles/eventEdit.css';
import '../styles/eventFilterBar.css';
import '../styles/eventsOrganized.css';
import '../styles/faq.css';
import '../styles/map.css';
import '../styles/myEvents.css';
import '../styles/nativeEventDetails.css';
import '../styles/newEvents.css';
import '../styles/pastEventsView.css';
import '../styles/popupArrival.css';
import '../styles/profile.css';
import '../styles/scrollToTopButton.css';
import '../styles/sideMenu.css';
import '../styles/signInChoice.css';
import '../styles/signUpChoice.css';
import '../styles/signIn.css';
import '../styles/signUp.css';
import '../styles/signUpOrganizer.css';
import '../styles/videoAd.css';
import '../styles/wazaaLoading.css';
import '../styles/welcomeInfos.css';
import '../styles/welcomeIntro.css';
import '../styles/legalMentions.css';
import '../styles/welcomeScreen.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.wazaa.app'),
  title: "WAZAA - Un monde d'événements autour de vous",
  description: "Découvrez des événements près de chez vous ! Explorez des expériences uniques, musicales, culturelles et touristiques avec Wazaa !",
  keywords: "événements, sorties, loisirs, culture, musique, tourisme, Wazaa, Bordeaux, Gironde, Sud-Ouest, France, Pays Basque, Landes, Pyrénées-Atlantiques",
  openGraph: {
    type: 'website',
    url: 'https://www.wazaa.app/',
    title: "WAZAA - Un monde d'événements autour de vous",
    description: "Découvrez des événements près de chez vous ! Explorez des expériences uniques, musicales, culturelles et touristiques avec Wazaa !",
    images: [{ url: '/og-image.png', width: 800, height: 600, alt: 'Og Image Alt' }]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@twitterhandle',
    title: "WAZAA - Un monde d'événements autour de vous",
    description: "Découvrez des événements près de chez vous ! Explorez des expériences uniques, musicales, culturelles et touristiques avec Wazaa !",
    images: { url: '/og-image.png', width: 800, height: 600, alt: 'Twitter Image Alt' }
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
  themeColor: '#000000',
};
/*
const sora = Sora({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});
*/
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="tdm-policy" content="all-rights-reserved" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="canonical" href="https://www.wazaa.app/" />
        <link rel="icon" sizes="48x48" href="/favicon-48x48.ico" />
        <link rel="icon" sizes="32x32" href="/favicon-32x32.ico" />
        <link rel="icon" sizes="16x16" href="/favicon-16x16.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
        <link rel="" as="image" href="https://api.mapbox.com/styles/v1/example/tiles/256/0/0/0?access_token=your_token" crossOrigin="anonymous" />
        <meta name="google-site-verification" content="rxFdv_sLMmx55m5kcOxYzhll02GuFHsgKKZuxPmkd8Q" />
        <Script async strategy="lazyOnload" id="hotjar">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3824705,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
        <Script
          id="google-tag-manager"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Wazaa",
              "url": "https://www.wazaa.app",
              "logo": "https://www.wazaa.app/logo192.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+33-6-65-51-19-93",
                "contactType": "Customer Service"
              }
            })
          }}
        />
      </head>
      <body>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
