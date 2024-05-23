// src/app/event/[citySlug]/[eventSlug]/[eventId]/metadata.tsx
export async function generateMetadata({ params }: { params: { eventId: string } }) {
  // const response = await fetch(`http://localhost:3000//api/events/${params?.eventId}`);
  const response = await fetch(`https://www.wazaa.app/api/events/${params?.eventId}`);
  const nativeEvent = await response.json();

  const removeAccents = (str: string) => {
    const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut = 'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';
    return str.split('').map((letter, index) => {
      const accentIndex = accents.indexOf(letter);
      return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');
  };

  const createEventSlug = (eventName: string) => {
    const noAccents = removeAccents(eventName);
    return noAccents.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
  };

  const eventName = nativeEvent.name;
  const eventDescription = nativeEvent.description || `Découvre l'événement ${eventName} sur Wazaa`;
  const eventImage = nativeEvent.photoUrl;
  const eventSlug = createEventSlug(eventName);
  const cityN = nativeEvent.location?.city;
  const citySlug = cityN ? createEventSlug(cityN) : 'evenement';

  return {
    title: `${eventName} | Wazaa`,
    description: `${eventDescription.substring(0, 150)}...`,
    openGraph: {
      title: `${eventName} | Wazaa`,
      description: `${eventDescription.substring(0, 150)}...`,
      url: `https://www.wazaa.app/events/${citySlug}/${eventSlug}/${params.eventId}`,
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
