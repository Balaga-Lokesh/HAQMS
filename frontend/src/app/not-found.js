'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center py-12 px-6 lg:px-8 text-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[rgba(191,220,255,0.95)] font-extrabold text-3xl mb-8">
          <Activity className="h-8 w-8" />
          MedFlow AI
        </Link>
        
        <div className="glass p-8 rounded-2xl border border-slate-800 shadow-xl max-w-sm mx-auto relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          <div className="p-4 bg-[rgba(255,255,255,0.02)] text-[var(--text-muted)] rounded-full w-fit mx-auto mb-6 shadow-sm">
            <ShieldAlert className="h-10 w-10" />
          </div>

          <h2 className="text-4xl font-black text-slate-100">404</h2>
          <h3 className="mt-2 text-xl font-bold text-slate-100">
            Page Not Found
          </h3>

          <p className="mt-4 text-sm text-slate-400">
            The requested page could not be found. Use the dashboard to continue.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="primary-btn inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
