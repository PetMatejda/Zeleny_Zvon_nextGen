import './globals.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Zelený Zvon | Holistické studio & E-shop',
  description: 'Místo, kde tělo a duše nacházejí společnou řeč. Holistické terapie, Bachovy esence, TRE, Pilates a přírodní produkty.',
  metadataBase: new URL('https://www.zelenyzvon.cz'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-background text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen flex flex-col">
        <Providers>
          <Navigation />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
