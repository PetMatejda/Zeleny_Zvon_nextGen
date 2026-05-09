import ReservationCalendar from '../../components/ReservationCalendar';

export const metadata = {
  title: 'Rezervace | Zelený Zvon',
  description: 'Zarezervujte si termín pro osobní konzultaci nebo proceduru u Zeleného Zvonu. Vyberte si datum a čas, který Vám nejlépe vyhovuje.',
};

export default function RezervacePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Osobní konzultace a procedury",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Zelený Zvon",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Město",
        "addressCountry": "CZ"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "Czech Republic"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Rezervační služby",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Konzultace"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* JSON-LD pro SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Rezervace termínu
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Vyberte si volný termín pro naši schůzku. Po odeslání žádosti Vám ji brzy potvrdíme.
          </p>
        </div>

        <ReservationCalendar />
      </div>
    </div>
  );
}
