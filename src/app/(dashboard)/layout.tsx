import { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/auth-guard';

export const metadata: Metadata = {
  title: 'Dashboard - LARO',
  description: 'Your basketball matchmaking dashboard - Find games, build teams, dominate the court.',
  keywords: ['basketball', 'dashboard', 'games', 'teams', 'courts', 'matchmaking'],
  openGraph: {
    title: 'Dashboard - LARO',
    description: 'Your basketball matchmaking dashboard - Find games, build teams, dominate the court.',
    type: 'website',
    images: [
      {
        url: '/og-dashboard.jpg',
        width: 1200,
        height: 630,
        alt: 'LARO Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - LARO',
    description: 'Your basketball matchmaking dashboard - Find games, build teams, dominate the court.',
    images: ['/og-dashboard.jpg']
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        {children}
      </div>
    </AuthGuard>
  );
}
