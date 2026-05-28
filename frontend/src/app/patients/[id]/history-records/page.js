'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { ArrowLeft, CalendarDays, Clock, FileText, User } from 'lucide-react';

export default function PatientHistoryRecordsPage() {
  const { API_BASE_URL, token, user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadPatient = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/patients/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Unable to load patient record.');
        }

        const payload = await response.json();
        setPatient(payload);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [API_BASE_URL, params.id, router, token, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold">Clinical record</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-100">Patient history overview</h1>
          </div>

          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-300 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        {loading ? (
          <div className="glass rounded-3xl p-8 text-slate-400 text-sm">Loading patient history...</div>
        ) : error ? (
          <div className="glass rounded-3xl p-8 border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm">
            {error}
          </div>
        ) : patient ? (
          <div className="space-y-6">
            <section className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-teal-300 text-sm font-semibold">
                    <User className="h-4 w-4" />
                    {patient.gender} patient
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-slate-100">{patient.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">{patient.phoneNumber}{patient.email ? ` · ${patient.email}` : ''}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm min-w-[220px]">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Age</p>
                    <p className="mt-2 text-xl font-black text-slate-100">{patient.age}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Appointments</p>
                    <p className="mt-2 text-xl font-black text-slate-100">{patient.appointments?.length || 0}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <FileText className="h-4 w-4" />
                Clinical notes
              </div>
              <p className="text-slate-300 leading-7">
                {patient.medicalHistory?.trim() || 'No clinical history recorded for this patient.'}
              </p>
            </section>

            <section className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <CalendarDays className="h-4 w-4" />
                Appointment timeline
              </div>

              {patient.appointments?.length ? (
                <div className="space-y-3">
                  {patient.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-white/8 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          {appointment.doctor?.name || 'Assigned doctor'}
                        </p>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mt-1">
                          {appointment.doctor?.specialization || 'Clinical visit'}
                        </p>
                      </div>

                      <div className="text-sm text-slate-300 flex flex-col sm:items-end gap-1">
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Clock className="h-4 w-4" />
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </span>
                        <span className="text-xs uppercase tracking-[0.24em] text-teal-300 font-semibold">
                          {appointment.status}
                        </span>
                        <span>{appointment.reason || 'No reason provided'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No appointments are associated with this patient yet.</p>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}