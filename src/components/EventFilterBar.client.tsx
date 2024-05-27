// src/components/EventFilterBar.client.tsx
'use client';
import React, { useState } from 'react';
import { faPalette, faChild, faFutbol, faUtensils, faW, faMusic, faTree, faBriefcase, faPlane } from '@fortawesome/free-solid-svg-icons';
import { useCategoryChange } from '../contexts/CategoryChangeContext';
import dynamic from 'next/dynamic';

const FontAwesomeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon), { ssr: false });

export const categories = [
  { id: 'all', icon: faW, label: 'TOUS' },
  { id: 'art', icon: faPalette, label: 'Art', keywords: ['art', 'culture', 'exposition', 'musée', 'théâtre', 'cinéma', 'concert', 'spectacle'] },
  { id: 'family', icon: faChild, label: 'Famille', keywords: ['enfant', 'famille', 'jeune', 'jeunesse', 'jeu', 'enfants', 'jeux', 'parc', 'parcs', 'jouet', 'dessin', 'dessins', 'coloriage', 'coloriages', 'cirque', 'clown', 'zoo', 'marché', 'vide grenier', 'vide-grenier', 'brocante', 'brocantes', 'fête', 'fêtes', 'anniversaire', 'anniversaires', 'noël', 'pâques', 'halloween', 'carnaval', 'cuisine', 'cuisiner', 'cuisinier', 'alimentation', 'nourriture', 'repas', 'dégustation', 'déguster', 'dégustations', 'déguster', 'gastronomie', 'restaurant', 'boulangerie', 'manger', 'pâtisserie', 'boisson', 'chocolaterie', 'traiteur', 'traiteurs'] },
  { id: 'sports', icon: faFutbol, label: 'Sport', keywords: ['sport', 'sports', 'football', 'rugby', 'basket', 'tennis', 'golf', 'course', 'randonnée', 'trail', 'marathon', 'vélo', 'cyclisme', 'natation', 'surf', 'championnat', 'match', 'compétition', 'pétanque', 'paddle', 'escalade', 'alpinisme', 'ski', 'snowboard', 'golf', 'roller', 'skate', 'parcours', 'yoga', 'pilates', 'fitness', 'musculation', 'crossfit', 'zumba', 'danse', 'boxe', 'foot'] },
  { id: 'food', icon: faUtensils, label: 'Food', keywords: ['food', 'foodtruck', 'marché', 'marchés', 'noël', 'producteur', 'bio', 'cuisine', 'cuisiner', 'cuisinier', 'alimentation', 'nourriture', 'repas', 'dégustation', 'déguster', 'dégustations', 'déguster', 'gastronomie', 'restaurant', 'brasserie', 'bar', 'café', 'boulangerie', 'manger', 'pâtisserie', 'boisson', 'chocolaterie', 'vin', 'fromagerie', 'fromageries', 'caviste', 'cavistes', 'épicerie', 'épiceries', 'traiteur', 'traiteurs'] },
  { id: 'music', icon: faMusic, label: 'Musique', keywords: ['musique', 'concert', 'festival', 'musicien', 'musiciens', 'chanteur', 'chanteurs', 'chanteuse', 'chanteuses', 'groupe', 'groupes', 'rock', 'pop', 'rap', 'hip-hop', 'jazz', 'blues', 'classique', 'électro', 'techno', 'house', 'disco', 'folk', 'country', 'reggae', 'ragga', 'ska', 'soul', 'funk', 'metal', 'hardcore', 'punk', 'indie','chanson', 'chansons', 'opéra', 'opéras', 'symphonie', 'symphonies', 'orchestre', 'orchestres', 'fanfare', 'fanfares', 'chorale', 'chorales', 'concerto', 'concertos', 'sonate', 'sonates', 'batterie', 'guitare', 'basse', 'violon', 'violoncelle', 'alto', 'flûte', 'clarinette', 'saxophone', 'trompette', 'trombone', 'piano', 'synthé', 'synthétiseur', 'accordéon', 'harpe', 'orgue', 'dj', 'deejay', 'soirée', 'bal', 'discothèque', 'boîte', 'club', 'bar', 'pub', 'musical', 'party', 'night', 'show'] },
  { id: 'nature', icon: faTree, label: 'Nature', keywords: ['nature', 'jardin', 'parc', 'forêt', 'plage', 'montagne', 'lac', 'rivière', 'mer', 'océan', 'campagne', 'randonnée', 'balade', 'pique-nique', 'pique nique', 'pêche', 'chasse', 'cueillette', 'champignon', 'fleur', 'fleurs', 'arbre', 'arbres', 'plante', 'plantes', 'animal', 'animaux', 'oiseau', 'oiseaux', 'insecte', 'insectes', 'yoga', 'bien-être', 'zen', 'méditation', 'relaxation', 'détente'] },
  { id: 'professionnal', icon: faBriefcase, label: 'Pro', keywords: ['professionnel', 'professionnels', 'entreprise', 'entreprises', 'b2b', 'b2c', 'startup', 'startups', 'conférence', 'conférences', 'séminaire', 'séminaires', 'formation', 'formations', 'salon', 'salons', 'exposition', 'expositions', 'networking', 'network', 'afterwork', 'afterworks', 'business', 'businesses', 'entrepreneur', 'entrepreneurs', 'entrepreneuriat', 'innovation', 'innovations', 'digital', 'numérique', 'tech', 'technologie', 'marketing', 'commercial', 'finance', 'comptabilité', 'juridique', 'rh', 'ressources humaines', 'recrutement', 'emploi', 'job', 'carrière', 'management', 'leadership', 'stratégie', 'économie', 'finance', 'banque', 'assurance', 'immobilier', 'industrie', 'agroalimentaire', 'médical', 'pharmaceutique', 'solidarité', 'humanitaire', 'forum', 'forums', 'colloque', 'congrès', 'convention', 'réunion', 'meeting', 'salon', 'crypto', 'cryptomonnaie', 'blockchain', 'nft', 'token'] },
  { id: 'tourism', icon: faPlane, label: 'Tourisme', keywords: ['tourisme', 'touriste', 'touristique', 'voyage', 'voyager', 'vacances', 'vacance', 'week-end', 'weekend', 'citytrip', 'city-trip', 'séjour', 'séjours', 'hôtel', 'hôtels', 'auberge', 'auberges', 'visite', 'fête', 'fêtes', 'festival', 'festivals', 'carnaval', 'carnavals', 'cérémonie', 'cérémonies', 'célébration', 'célébrations', 'tradition', 'traditions', 'patrimoine', 'patrimoines', 'monument', 'monuments', 'château', 'châteaux', 'musée', 'musées', 'exposition', 'expositions', 'parc', 'parcs', 'jardin', 'jardins', 'plage', 'plages', 'montagne', 'montagnes', 'lac', 'océan', 'océans', 'croisière', 'croisières', 'camping', 'campings', 'randonnée', 'randonnées', 'balade', 'balades', 'pique-nique', 'pique nique', 'santé', 'pêche', 'yoga', 'bien-être', 'zen', 'méditation', 'relaxation', 'détente'] },
];

const EventFilterBar = () => {
  const { onCategoryChange } = useCategoryChange();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="event-filter-bar_container">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`event-filter-bar_filter-button ${category.id === 'all' ? 'event-filter-bar_main-button' : ''} ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <FontAwesomeIcon icon={category.icon} />
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default EventFilterBar;
