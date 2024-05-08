'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section-left">
          <h4 className="footer-about-button">
            <Link href="/qui-sommes-nous">
              A propos de WAZAA
            </Link>
          </h4>
          <p><q>Divertir et inspirer le monde</q></p>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email : <a href="mailto:hello@wazaa.app">hello@wazaa.app</a></p>
        </div>
        <div className="footer-section">
          <h4>Suivez-nous</h4>
          <div className="social-icons">
            <a href="https://www.facebook.com/wazaa.official" target="_blank" rel="noreferrer">
              <Image src="/icon-facebook.svg" alt="Facebook" width={30} height={30} />
            </a>
            <a href="https://www.linkedin.com/company/wazaa-app/" target="_blank" rel="noreferrer">
              <Image src="/icon-twitter.svg" alt="Twitter" width={30} height={30} />
            </a>
            <a href="https://www.instagram.com/wazaa.app/" target="_blank" rel="noreferrer">
              <Image src="/icon-instagram.svg" alt="Instagram" width={30} height={30} />
            </a>
            {/* Ajoutez d'autres icônes de réseaux sociaux si nécessaire */}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} WAZAA. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
