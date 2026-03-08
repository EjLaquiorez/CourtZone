import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Court Zone',
  description: 'Sign in or create your Court Zone basketball account to connect with players and find games.',
  keywords: ['basketball', 'login', 'register', 'authentication', 'sign up'],
  openGraph: {
    title: 'Join Court Zone Basketball Community',
    description: 'Sign in or create your account to connect with basketball players and find games.',
    type: 'website',
    images: [
      {
        url: '/og-auth.jpg',
        width: 1200,
        height: 630,
        alt: 'Court Zone Authentication'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Court Zone Basketball Community',
    description: 'Sign in or create your account to connect with basketball players and find games.',
    images: ['/og-auth.jpg']
  }
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {children}
    </div>
  );
}
