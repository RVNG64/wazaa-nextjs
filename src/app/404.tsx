/* eslint-disable react/no-unescaped-entities */
// src/pages/404.tsx
import React from 'react';
import Link from 'next/link';

const Custom404 = () => {
  return (
    <div>
      <h1>404 - Page Introuvable</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link href="/">
        <a>Retour à l'accueil</a>
      </Link>
    </div>
  );
};

export default Custom404;
