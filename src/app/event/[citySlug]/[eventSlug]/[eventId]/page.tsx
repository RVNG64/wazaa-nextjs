// src/app/event/[citySlug]/[eventSlug]/[eventId]/page.tsx
'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const EventDetailsClient = dynamic(() => import('./EventDetailsClient'), { ssr: false });

const EventDetails = () => {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId;

  if (!eventId) {
    return <div>Erreur : ID de l&apos;événement introuvable</div>;
  }

  return <EventDetailsClient eventId={eventId} />;
};

export default EventDetails;
