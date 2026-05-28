'use client';

import Link from 'next/link';
import { Activity, MonitorPlay, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full mt-12 sm:mt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(91,140,255,0.08)] text-[rgba(223,236,255,0.98)] text-sm font-medium mb-6 border border-[rgba(91,140,255,0.14)]">
              <Activity className="h-4 w-4" />
              Operational intelligence for modern clinics
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-teal-200 bg-clip-text text-transparent">
              MedFlow AI
            </h1>
            <p className="text-xl sm:text-2xl font-bold mt-3 text-slate-200">
              Healthcare operations software built for appointment flow, queue visibility, and staff coordination.
            </p>

            <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-8 mx-auto lg:mx-0">
              Streamline front-desk work, physician calling, and patient scheduling in a polished interface designed for real clinical teams.
            </p>

            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 text-sm text-slate-300">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Appointment booking</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Live queue control</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Role-based access</span>
            </div>
          </div>

          <div className="glass p-6 sm:p-8 rounded-[2rem] border border-slate-200/10 shadow-2xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <Users className="h-6 w-6 text-cyan-300" />
                <h2 className="mt-4 text-lg font-bold text-slate-100">Staff Portal</h2>
                <p className="mt-2 text-sm text-slate-400">Secure access for administrators, doctors, and receptionists.</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <MonitorPlay className="h-6 w-6 text-teal-300" />
                <h2 className="mt-4 text-lg font-bold text-slate-100">Live Monitor</h2>
                <p className="mt-2 text-sm text-slate-400">Public queue visibility with controlled refresh cadence.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/login" className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 transition-transform hover:-translate-y-0.5">
                Open Staff Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/queue" className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-white/5 border border-white/10 text-slate-100 font-bold transition-colors hover:bg-white/10">
                View Queue Board
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-slate-400 dark:text-slate-500 text-xs mt-12">
        © 2026 MedFlow AI. Premium healthcare operations software.
      </footer>
    </div>
  );
}
