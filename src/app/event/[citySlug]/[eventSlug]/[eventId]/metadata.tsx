// src/app/event/[citySlug]/[eventSlug]/[eventId]/metadata.ts
export async function generateMetadata({ params }: { params: { eventId: string } }) {
  // const response = await fetch(`http://localhost:3000/api/event/${params.eventId}`);
  const response = await fetch(`https://www.wazaa.app/api/event/${params.eventId}`);
  const eventData = await response.json();

  const removeAccents = (str: string) => {
    const accents =
      'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut =
      'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';

    return str.split('').map((letter: string, index: number) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');
  };

  const createEventSlug = (eventName: string) => {
    const noAccents = removeAccents(eventName);
    return noAccents
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  const eventN = eventData['rdfs:label']?.fr?.[0];
  const eventSlug = createEventSlug(eventN);
  const city = eventData.isLocatedAt[0]['schema:address']?.[0]['schema:addressLocality'];
  const citySlug = city ? createEventSlug(city) : 'evenement';
  const eventName = eventData?.['rdfs:label']?.fr?.[0] || 'Événement inconnu';
  const eventDescription = eventData?.['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Description non disponible';
  const eventImage = eventData?.['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || '';

  return {
    title: `${eventName} | Wazaa`,
    description: `${eventDescription.substring(0, 150)}...`,
    openGraph: {
      title: `${eventName} | Wazaa`,
      description: `${eventDescription.substring(0, 150)}...`,
      url: `https://www.wazaa.app/event/${citySlug}/${eventSlug}/${params.eventId}`,
      images: [{ url: eventImage }],
      siteName: 'Wazaa',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: 'WAZAA',
      creator: 'WAZAA',
      title: eventName,
      description: `${eventDescription.substring(0, 150)}...`,
      images: [eventImage],
    },
  };
}
