
// import { useMapContext } from '../MapContext';
import Image from 'next/image';
import { NativeEvent } from '../contexts/NativeEventContext';

interface POI {
  '@id': string;
  'dc:identifier': string;
  'schema:endDate': string[];
  'schema:startDate': string[];
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
  'creationDate': string;
  'hasAudience': Audience[];
  'hasBeenCreatedBy': Agent;
  'hasBeenPublishedBy': Agent[];
  'hasBookingContact': Agent[];
  'hasContact': Agent[];
  'hasDescription': Description[];
  'hasGeographicReach': GeographicReach[];
  'hasMainRepresentation': EditorialObject[];
  'hasNeighborhood': SpatialEnvironmentTheme[];
  'hasRepresentation': EditorialObject[];
  'hasTheme': Theme[];
  'isLocatedAt': Place[];
  'isOwnedBy': Agent[];
  'lastUpdate': string;
  'lastUpdateDatatourisme': string;
  'offers': Offer[];
  'reducedMobilityAccess': boolean;
  'takesPlaceAt': Period[];
}

interface Audience {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface Agent {
  '@id': string;
  'dc:identifier': string;
  'schema:legalName': string;
  '@type': string[];
  'schema:email'?: string;
  'schema:telephone'?: string;
  'foaf:homepage'?: string;
}

interface Description {
  '@id': string;
  'dc:description': { [language: string]: string[] };
  '@type': string[];
}

interface GeographicReach {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface EditorialObject {
  '@id': string;
  'ebucore:hasRelatedResource': Resource[];
  'ebucore:title'?: { [language: string]: string[] };
  // Autres champs spécifiques à EditorialObject
}

interface SpatialEnvironmentTheme {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface Theme {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface Place {
  '@id': string;
  'schema:address': PostalAddress[];
  'schema:geo': GeoCoordinates;
  '@type': string[];
}

interface PostalAddress {
  '@id': string;
  'schema:addressLocality': string;
  'schema:postalCode': string;
  'schema:streetAddress': string[];
  '@type': string[];
}

interface GeoCoordinates {
  '@id': string;
  'schema:latitude': string;
  'schema:longitude': string;
  '@type': string[];
}

interface Offer {
  '@id': string;
  'schema:acceptedPaymentMethod': PaymentMethod[];
  'schema:priceSpecification': PriceSpecification[];
  '@type': string[];
  'schema:description'?: { [language: string]: string[] };
}

interface Period {
  '@id': string;
  '@type': string[];
  'endDate': string;
  'startDate': string;
  'startTime'?: string;
  'endTime'?: string;
}

interface PaymentMethod {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface PriceSpecification {
  '@id': string;
  'schema:maxPrice'?: string;
  'schema:minPrice'?: string;
  'schema:priceCurrency': string;
  '@type': string[];
  'schema:value'?: string;
}

interface Resource {
  '@id': string;
  'ebucore:hasMimeType': MimeType[];
  'ebucore:locator': string;
  '@type': string[];
}

interface MimeType {
  '@id': string;
  '@type': string[];
  'rdfs:label': { [language: string]: string[] };
}

interface ListViewProps {
  isVisible: boolean;
  events: POI[];
  nativeEvents: NativeEvent[];
  onEventClick: (poi: POI | NativeEvent) => void;
}

const ListView: React.FC<ListViewProps> = ({ isVisible, events, nativeEvents, onEventClick }) => {
  const listViewClass = isVisible ? "list-view active" : "list-view";
  // const { mapInstance } = useMapContext();

  /* const handleViewOnMap = (poi: POI) => {
    if (mapInstance) {
      mapInstance.flyTo([parseFloat(poi.Latitude), parseFloat(poi.Longitude)], 15);
    }
  }; */

  // Fonction pour vérifier si l'événement est un POI
  const isPOI = (event: POI | NativeEvent): event is POI => {
    return (event as POI)['@id'] !== undefined;
  };

  // Fonction pour obtenir le timestamp de la date de début pour les deux types d'événements
  const convertDateToISO = (dateStr: string) => {
    const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : dateStr;
  };

  const getEventStartDateTimestamp = (event: POI | NativeEvent) => {
    let dateStr = 'schema:startDate' in event ? event['schema:startDate'][0] : event.startDate;
    dateStr = convertDateToISO(dateStr);
    return new Date(dateStr).getTime();
  };

  const allEvents = [...events, ...nativeEvents];
  const allSortedEvents = allEvents.sort((a, b) => getEventStartDateTimestamp(a) - getEventStartDateTimestamp(b));

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';

    // Vérifie si la date est au format MM/JJ/AAAA et la convertit en JJ/MM/AAAA
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);
    if (match) {
      dateString = `${match[2]}/${match[1]}/${match[3]}`;
    }

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className={listViewClass}>
      {allSortedEvents.map((event: POI | NativeEvent) => {
        const key = '@id' in event ? event['@id'] : event.eventID;
        let name, description, image, address, postalCode, locality, fullAddress, startDate, endDate, isSameDate, displayDate;

        if (isPOI(event)) {
          name = event['rdfs:label']?.fr?.[0] || 'Nom inconnu';
          description = event['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Pas de description';
          const DESCRIPTION_LIMIT = 200;
          if (description.length > DESCRIPTION_LIMIT) {
            description = description.substring(0, DESCRIPTION_LIMIT) + '...';
          }
          const defaultImageUrl = 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
          const imageUrl = event['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'] || defaultImageUrl;
          image = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

          const addressObject = event['isLocatedAt']?.[0]?.['schema:address']?.[0];
          const streetAddress = addressObject ? addressObject['schema:streetAddress']?.[0] : 'Adresse inconnue';
          const postalCode = addressObject ? addressObject['schema:postalCode'] : '';
          const locality = addressObject ? addressObject['schema:addressLocality'] : '';

          // Combinaison de postalCode et locality
          let postalCodeAndLocality = '';
          if (postalCode || locality) {
            postalCodeAndLocality = postalCode && locality ? `${postalCode} ${locality}` : postalCode || locality;
          }

          // Construction de l'adresse complète
          const addressParts = [];
          if (streetAddress !== 'Adresse inconnue') addressParts.push(streetAddress);
          if (postalCodeAndLocality) addressParts.push(postalCodeAndLocality);

          fullAddress = addressParts.join(', ') || 'Adresse non disponible';

          startDate = event['schema:startDate']?.[0];
          endDate = event['schema:endDate']?.[0];
          isSameDate = startDate === endDate;
          displayDate = isSameDate ? formatDate(startDate) : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;
        } else { // Si l'événement est un événement natif
          name = event.name;
          description = event.description || 'Pas de description';
          image = event.photoUrl || 'https://res.cloudinary.com/dvzsvgucq/image/upload/v1693844552/hervemake_A_determined_business_owner_engaging_in_a_networking__4d7e7005-1d7f-4395-a9b6-d2bd94e12421_vdnels.png';
          address = event.location?.address || 'Adresse inconnue';
          postalCode = event.location?.postalCode || '';
          locality = event.location?.city || '';
          fullAddress = `${address}, ${postalCode} ${locality}`;
          const formattedStartDate = formatDate(event.startDate);
          const formattedEndDate = formatDate(event.endDate);
          displayDate = formattedStartDate === formattedEndDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;
        }

        return (
          <div key={key} className="list-item" onClick={() => onEventClick(event)}>
            {image && (
              <div className="item-image">
                <Image src={image} alt={name} width="298" height="200" />
              </div>
            )}
            <div className="item-content">
              <h3>{name}</h3>
              <p className="item-description">{description}</p>
              <div className="item-footer">
                <div>
                  <i className="fas fa-map-marker-alt"></i> {fullAddress}
                </div>
                <div>
                  <i className="fas fa-calendar-alt"></i> {displayDate}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
