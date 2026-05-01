'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from '../components/CartProvider';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CartProvider>
        {children}
      </CartProvider>
    </GoogleOAuthProvider>
  );
}
