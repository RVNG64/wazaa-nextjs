// pages/_app.tsx
import React from 'react';
import '../styles/navbar.css';
import '../styles/footer.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { EventsProvider } from '../contexts/EventContext';
import { NativeEventProvider } from '../contexts/NativeEventContext';
import Navbar from '../components/Navbar.client';
import Footer from '../components/Footer.client';
import CookieConsent from "react-cookie-consent";

function MyApp({ Component, pageProps }: AppProps) {
  const [currentPath, setCurrentPath] = React.useState<string>('/');

  const handlePathChange = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <AuthProvider>
      <NativeEventProvider>
        <EventsProvider>
          <Navbar onPathChange={handlePathChange} />
          <Component {...pageProps} />
          <CookieConsent
            location="bottom"
            buttonText="Accept"
            cookieName="user-cookie-consent"
            style={{ background: "#000" }}
            buttonStyle={{ color: "#fff", fontSize: "13px", borderRadius: "5px" }}
          >
            This website uses cookies to enhance the user experience.
          </CookieConsent>
          {currentPath !== "/" && currentPath !== "/match" && <Footer />}
        </EventsProvider>
      </NativeEventProvider>
    </AuthProvider>
  );
}

export default MyApp;
