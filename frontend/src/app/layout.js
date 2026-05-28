import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'HAQMS - Hospital Appointment & Queue Management',
  description: 'MedFlow AI — Real-time healthcare operations and queue orchestration platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen gradient-bg`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[10%] w-[420px] h-[420px] bg-[rgba(91,140,255,0.18)] blur-[80px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[10%] w-[380px] h-[380px] bg-[rgba(99,245,210,0.08)] blur-[80px] rounded-full" />
        </div>

        <div className="relative z-10">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
