'use client';

import Link from 'next/link';
import { Activity, ShieldAlert, MonitorPlay, Users, CalendarDays, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full text-center mt-12 sm:mt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(91,140,255,0.06)] text-[rgba(191,220,255,0.95)] text-sm font-medium mb-6">
          <Activity className="h-4 w-4" />
          Live queue tracking
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
          HAQMS
        </h1>
        <p className="text-xl sm:text-2xl font-bold mt-2 text-slate-700 dark:text-slate-200">
          Hospital Appointment & Queue Management System
        </p>

        <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-8">
          A secure, production-ready platform for managing patient flow, appointments, and clinical operations.
        </p>

        {/* Action Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
          {/* Card 1: Staff Portal */}
          <Link href="/login" className="group">
            <div className="glass p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
              <div className="p-3 bg-[rgba(91,140,255,0.06)] text-[rgba(191,220,255,0.95)] rounded-xl w-fit group-hover:bg-[rgba(91,140,255,0.14)] transition-colors duration-300 shadow-sm group-hover:shadow-blue-400/10">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Staff Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                Access your specialized dashboard. Supports role-based workflows for Administrators, Doctors, and Receptionists.
              </p>
            </div>
          </Link>

          {/* Card 2: Public Queue Monitor */}
          <Link href="/queue" className="group">
            <div className="glass p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-left hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
              <div className="p-3 bg-[rgba(99,245,210,0.04)] text-[rgba(191,220,255,0.95)] rounded-xl w-fit group-hover:bg-[rgba(99,245,210,0.08)] transition-colors duration-300 shadow-sm group-hover:shadow-cyan-400/8">
                <MonitorPlay className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Live Public Monitor
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                Real-time active queue board tracking patient check-ins and calling tokens by physician. Built with live refresh.
              </p>
            </div>
          </Link>
        </div>

        {/* (Assessment notes removed from UI; retained in docs/README) */}
      </div>

      <footer className="text-center text-slate-400 dark:text-slate-500 text-xs mt-12">
        © 2026 MedFlow AI. Secure Healthcare Operations Platform.
      </footer>
    </div>
  );
}
