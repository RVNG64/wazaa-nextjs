import Image from 'next/image';
import '../styles/pastEventsView.css';

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

interface NativeEvent {
  eventID: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  address: string;
  latitude: number;
  longitude: number;
  poster: string;
  startTime?: string;
  endTime?: string;
}

interface PastEventsView {
  isVisible: boolean;
  events: POI[];
  onEventClick: (poi: POI) => void;
}

const PastEventsView: React.FC<PastEventsView> = ({ isVisible, events, onEventClick }) => {
  const listViewClass = isVisible ? "list-view active" : "list-view";
  // const { mapInstance } = useMapContext();

  /* const handleViewOnMap = (poi: POI) => {
    if (mapInstance) {
      mapInstance.flyTo([parseFloat(poi.Latitude), parseFloat(poi.Longitude)], 15);
    }
  }; */

  // Fonction pour obtenir le timestamp de la date de début
  const getStartDateTimestamp = (periodes: string) => {
    if (!periodes) {
      return new Date().getTime();
    }

    const startDateStr = periodes.split('<->')[0];
    const startDate = new Date(startDateStr);
    return startDate.getTime();
  };

  // Trier les événements par date de début
  const sortedEvents = events.sort((a, b) => {
    const aTimestamp = a['schema:startDate'] ? getStartDateTimestamp(a['schema:startDate'][0]) : new Date().getTime();
    const bTimestamp = b['schema:startDate'] ? getStartDateTimestamp(b['schema:startDate'][0]) : new Date().getTime();
    return aTimestamp - bTimestamp;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={listViewClass}>
      {sortedEvents.map((event: POI) => {
        // Extraction des informations du POI
        const poiName = event['rdfs:label']?.fr?.[0] || 'Nom inconnu';
        const poiDescription = event['hasDescription']?.[0]?.['dc:description']?.fr?.[0] || 'Pas de description';
        const poster = event['hasMainRepresentation']?.[0]?.['ebucore:hasRelatedResource']?.[0]?.['ebucore:locator'];
        const poiImage = Array.isArray(poster) ? poster[0] : poster;
        const addressObject = event['isLocatedAt']?.[0]?.['schema:address']?.[0];
        const streetAddress = addressObject?.['schema:streetAddress']?.[0] || '';
        const postalCode = addressObject?.['schema:postalCode'] || '';
        const addressLocality = addressObject?.['schema:addressLocality'] || '';

        let fullAddress = '';
        if (streetAddress) fullAddress += streetAddress;
        if (postalCode || addressLocality) fullAddress += (fullAddress ? ', ' : '') + `${postalCode} ${addressLocality}`.trim();

        const formattedStartDate = formatDate(event['schema:startDate']?.[0]);
        const formattedEndDate = formatDate(event['schema:endDate']?.[0]);
        const isSameDate = event['schema:startDate']?.[0] === event['schema:endDate']?.[0];
        const displayDate = isSameDate ? formattedStartDate : `Du ${formattedStartDate} au ${formattedEndDate}`;
        const startTime = formatTime(event['takesPlaceAt']?.[0]?.['startTime'] || '');
        const endTime = formatTime(event['takesPlaceAt']?.[0]?.['endTime'] || '');
        const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';

        return (
          <div key={event['@id']} className="list-item" onClick={() => onEventClick(event)}>
            {poiImage && (
              <div className="item-image">
                <Image src={poiImage} alt={poiName} width={300} height={200} priority style={{ width: 'auto' }} />
              </div>
            )}
            <div className="item-content">
              <h3>{poiName}</h3>
              <p className="item-description">{poiDescription}</p>
              <div className="item-footer">
                <div>
                  <i className="fas fa-clock"></i> {timeRange}
                </div>
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

export default PastEventsView;
