'use client';

import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Users, CalendarDays, Activity, Search, Sparkles, UserPlus, 
  Trash2, ClipboardList, TrendingUp, DollarSign, Award, Clock,
  ArrowRight, ShieldAlert, CheckCircle, Volume2
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, API_BASE_URL, logout } = useAuth();
  const router = useRouter();

  // Navigation Guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // Global State
  const [activeTab, setActiveTab] = useState('reports');
  const [suppressInitialPatientLoad, setSuppressInitialPatientLoad] = useState(true);

  // ==========================================
  // STATE FOR RECEPTIONIST WORKFLOWS
  // ==========================================
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientGender, setPatientGender] = useState('All');
  const [patientsPagination, setPatientsPagination] = useState({ page: 1, totalPages: 1 });
  const deferredPatientSearch = useDeferredValue(patientSearch);
  
  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('MALE');
  const [regHistory, setRegHistory] = useState('');
  const [regMessage, setRegMessage] = useState('');

  // Queue and Appointment Booking
  const [doctorsList, setDoctorsList] = useState([]);
  const [bookingPatientId, setBookingPatientId] = useState('');
  const [bookingDoctorId, setBookingDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [checkinMessage, setCheckinMessage] = useState('');

  // ==========================================
  // STATE FOR DOCTOR WORKFLOWS
  // ==========================================
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);

  // ==========================================
  // STATE FOR ADMIN WORKFLOWS
  // ==========================================
  const [adminReportData, setAdminReportData] = useState(null);
  const [adminReportLoading, setAdminReportLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    setActiveTab(
      user.role === 'ADMIN'
        ? 'reports'
        : user.role === 'RECEPTIONIST'
          ? 'patients'
          : 'appointments'
    );
  }, [user]);

  // ==========================================
  // RECEPTIONIST FUNCTIONS
  // ==========================================
  
  // Fetch Patients List
  const fetchPatients = async (page = 1, search = deferredPatientSearch, gender = patientGender) => {
    setPatientsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '5',
        search,
        gender,
      });

      const res = await fetch(`${API_BASE_URL}/patients?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
        setPatientsPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          totalPatients: data.pagination.totalPatients
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPatientsLoading(false);
    }
  };

  // Trigger Patient List Fetch (now opt-in to allow testing registration flows)
  useEffect(() => {
    if (!user || suppressInitialPatientLoad) return;

    if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
      fetchPatients(1, deferredPatientSearch, patientGender);
    }
  }, [deferredPatientSearch, patientGender, suppressInitialPatientLoad, user, token, API_BASE_URL]);

  // Fetch Doctors for booking drop-down
  const fetchDoctorsDropdown = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDoctorsList(data.doctors || data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const [suppressInitialDoctorsLoad, setSuppressInitialDoctorsLoad] = useState(true);

  useEffect(() => {
    if (!suppressInitialDoctorsLoad) fetchDoctorsDropdown();
  }, [suppressInitialDoctorsLoad]);

  const activeQueueCount = doctorQueue.length;
  const appointmentsTodayCount = doctorAppointments.length;
  const doctorsCount = doctorsList.length;

  const groupedDoctors = useMemo(() => ({
    activeQueueCount,
    appointmentsTodayCount,
    doctorsCount,
  }), [activeQueueCount, appointmentsTodayCount, doctorsCount]);

  // Handle Patient Registration
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegMessage('');

    // INCONSISTENT VALIDATION: Receptionist form doesn't validate telephone structure on client, 
    // leading to database pollution (e.g. text telephone values)
    if (!regName || !regPhone || !regAge) {
      setRegMessage('Error: Name, Age and Phone number are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phoneNumber: regPhone,
          age: regAge,
          gender: regGender,
          medicalHistory: regHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setRegMessage('Success: Patient registered successfully!');
        // Clear fields
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegAge('');
        setRegHistory('');
        // Refresh directory
        fetchPatients(1);
      } else {
        setRegMessage(`Error: ${data.error || 'Failed to register'}`);
      }
    } catch (err) {
      setRegMessage(`Error: ${err.message}`);
    }
  };

  // Handle Appointment Booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingMessage('');

    if (!bookingPatientId || !bookingDoctorId || !bookingDate) {
      setBookingMessage('Error: All booking fields are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: bookingPatientId,
          doctorId: bookingDoctorId,
          appointmentDate: bookingDate,
          reason: bookingReason
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBookingMessage('Success: Appointment booked successfully!');
        setBookingReason('');
        if (user.role === 'DOCTOR') fetchDoctorWorklist();
      } else {
        setBookingMessage(`Error: ${data.error || 'Failed to book'}`);
      }
    } catch (err) {
      setBookingMessage(`Error: ${err.message}`);
    }
  };

  // Delete Patient (Bypassed authorization admin check!)
  const handleDeletePatient = async (id) => {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Patient deleted.');
        fetchPatients(patientsPagination.page);
      } else {
        alert(`Error: ${data.error || 'Unauthorized deletion!'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Queue Token Checkin (Race condition API!)
  const handleQueueCheckin = async (patientId, doctorId, appointmentId = null) => {
    setCheckinMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/queue/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientId, doctorId, appointmentId })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckinMessage(`Checked in! Generated Token #${data.token.tokenNumber}`);
        if (user.role === 'DOCTOR') fetchDoctorWorklist();
      } else {
        setCheckinMessage(`Error check-in: ${data.error}`);
      }
    } catch (err) {
      setCheckinMessage(`Error: ${err.message}`);
    }
  };

  // ==========================================
  // DOCTOR WORKFLOW FUNCTIONS
  // ==========================================
  const fetchDoctorWorklist = async () => {
    if (user.role !== 'DOCTOR') return;
    try {
      // Find matching doctor from doctors dropdown using user ID link
      const matchedDoc = doctorsList.find(d => d.userId === user.id);
      if (!matchedDoc) return;

      // 1. Fetch appointments for this doctor (N+1 database queries triggers inside server)
      const appRes = await fetch(`${API_BASE_URL}/appointments?doctorId=${matchedDoc.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appData = await appRes.json();
      if (appData.success) {
        setDoctorAppointments(appData.appointments);
      }

      // 2. Fetch queue list for this doctor today
      const queueRes = await fetch(`${API_BASE_URL}/queue?doctorId=${matchedDoc.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const queueData = await queueRes.json();
      setDoctorQueue(queueData);

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (user.role === 'DOCTOR' && doctorsList.length > 0) {
      fetchDoctorWorklist();
    }
  }, [doctorsList]);

  // Auto-load doctors when user navigates to booking/physicians tabs
  useEffect(() => {
    if (!user) return;
    if (['book', 'physicians', 'appointments'].includes(activeTab) && doctorsList.length === 0) {
      setSuppressInitialDoctorsLoad(false);
      fetchDoctorsDropdown();
    }
  }, [activeTab, user]);

  // Update token status (WAITING -> CALLING -> COMPLETED / SKIPPED)
  const handleUpdateQueueStatus = async (tokenId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/${tokenId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchDoctorWorklist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete consultation of an appointment
  const handleCompleteAppointment = async (appId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (res.ok) {
        fetchDoctorWorklist();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // ADMIN SYSTEM WORKFLOWS
  // ==========================================
  
  // Slow report generator fetch
  const generateSystemReport = async () => {
    setAdminReportLoading(true);
    try {
      // Calls slow nested aggregation endpoint
      const res = await fetch(`${API_BASE_URL}/reports/doctor-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdminReportData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminReportLoading(false);
    }
  };

  // Search Doctors (secure API)
  const searchPhysiciansAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors?search=${encodeURIComponent(adminSearchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDoctorsList(data.doctors || data || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">

        {/* Dashboard Hero */}
        <div className="mb-10">
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[rgba(91,140,255,0.06)] blur-2xl rounded-full" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[rgba(91,140,255,0.06)] border border-[rgba(91,140,255,0.06)] text-[rgba(191,220,255,0.95)] text-xs font-bold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                AI HOSPITAL OPERATIONS CENTER
              </span>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white">
                Welcome back, {user.name}
              </h1>

              <p className="mt-3 text-slate-400 max-w-2xl leading-7">
                Real-time patient operations, intelligent appointment orchestration,
                and secure healthcare workflow management.
              </p>
            </div>
          </div>
        </div>
        
        {/* Metric Cards */}
        <div className="grid gap-5 md:grid-cols-4 mb-10">
          <div className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold">Active Queue</p>
            <h3 className="mt-3 text-3xl font-black text-white">{groupedDoctors.activeQueueCount}</h3>
            <p className="mt-2 text-xs text-emerald-400 font-semibold">+12% operational flow</p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold">Appointments Today</p>
            <h3 className="mt-3 text-3xl font-black text-white">{groupedDoctors.appointmentsTodayCount}</h3>
            <p className="mt-2 text-xs text-emerald-400 font-semibold">On track</p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold">Doctors Online</p>
            <h3 className="mt-3 text-3xl font-black text-white">{groupedDoctors.doctorsCount}</h3>
            <p className="mt-2 text-xs text-emerald-400 font-semibold">Realtime roster</p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold">System Health</p>
            <h3 className="mt-3 text-3xl font-black text-white">Healthy</h3>
            <p className="mt-2 text-xs text-emerald-400 font-semibold">All services nominal</p>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto">
          {user.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('reports')}
                className={`pill-tab font-bold text-sm whitespace-nowrap ${activeTab === 'reports' ? 'pill-tab-active' : ''}`}
              >
                System Audit Reports
              </button>
              <button
                onClick={() => setActiveTab('physicians')}
                className={`pill-tab font-bold text-sm whitespace-nowrap ${activeTab === 'physicians' ? 'pill-tab-active' : ''}`}
              >
                Physician Registry
              </button>
            </>
          )}

          {(user.role === 'RECEPTIONIST' || user.role === 'ADMIN') && (
            <>
              <button
                onClick={() => setActiveTab('patients')}
                className={`pill-tab font-bold text-sm whitespace-nowrap ${activeTab === 'patients' ? 'pill-tab-active' : ''}`}
              >
                Patient Registry Directory
              </button>
              <button
                onClick={() => setActiveTab('book')}
                className={`pill-tab font-bold text-sm whitespace-nowrap ${activeTab === 'book' ? 'pill-tab-active' : ''}`}
              >
                Scheduling / Check-in Portal
              </button>
            </>
          )}

          {user.role === 'DOCTOR' && (
            <>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`pill-tab font-bold text-sm whitespace-nowrap ${activeTab === 'appointments' ? 'pill-tab-active' : ''}`}
              >
                My Scheduled Bookings
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`pill-tab font-bold text-sm whitespace-nowrap ${activeTab === 'queue' ? 'pill-tab-active' : ''}`}
              >
                Active Calling Queue
              </button>
            </>
          )}
        </div>

        {/* Global Notifications Panel */}
        {checkinMessage && (
          <div className="p-4 mb-6 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-between text-sm">
            <span>{checkinMessage}</span>
            <button onClick={() => setCheckinMessage('')} className="font-bold underline text-xs">Dismiss</button>
          </div>
        )}

        {/* ==============================================================
            TAB: PATIENT REGISTRY (RECEPTIONIST & ADMIN)
            ============================================================== */}
        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Directory Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                    <ClipboardList className="h-5 w-5 text-teal-600" />
                    Patient Lookup Directory
                  </h3>

                  {/* Filters (Causes slow re-renders on keystroke) */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search by name, phone or email..."
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    >
                      <option value="All">All Genders</option>
                      <option value="MALE">Male</option>
<option value="FEMALE">Female</option>
<option value="OTHER">Other</option>
                    </select>
                      {/* Load directory on demand so registration can be tested */}
                      {suppressInitialPatientLoad && (
                        <button
                          onClick={() => { setSuppressInitialPatientLoad(false); fetchPatients(1); }}
                          className="px-3 py-2 rounded border border-teal-500 text-teal-600 text-xs font-semibold hover:bg-teal-500/10"
                        >
                          Load Directory
                        </button>
                      )}
                  </div>

                  {/* Table listing */}
                  {patientsLoading ? (
                    <p className="text-center py-6 text-slate-400 animate-pulse text-sm">Synchronizing table data...</p>
                  ) : patients.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      <p>Directory not loaded or no matching records.</p>
                      <p className="mt-2">Register a new patient with the form on the right to see realtime updates.</p>
                      {!suppressInitialPatientLoad && (
                        <p className="mt-2 font-semibold">No patients currently registered.</p>
                      )}
                    </div>
                  ) : (
                    <div className="table-wrapper glass p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                          <thead className="table-header-bg">
                            <tr className="text-[var(--text-muted)] uppercase tracking-widest text-xxs font-bold">
                              <th className="pb-3">Name</th>
                              <th className="pb-3">Contact</th>
                              <th className="pb-3">Age/Sex</th>
                              <th className="pb-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {patients.map((p) => (
                              <tr key={p.id} className="table-row-hover transition-all duration-200">
                                <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                                  {p.name}
                                  {p.email && <span className="block text-xxs text-slate-400 font-normal mt-0.5">{p.email}</span>}
                                </td>
                                <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">{p.phoneNumber}</td>
                                <td className="py-3.5 text-slate-500 dark:text-slate-400">
                                  {p.age} yrs / <span className="capitalize">{p.gender}</span>
                                </td>
                                <td className="py-3.5 text-right space-x-2">
                                  <button
                                    onClick={() => handleQueueCheckin(p.id, doctorsList[0]?.id)}
                                    className="text-xxs px-2.5 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-500 hover:text-white transition-colors"
                                  >
                                    Check In
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeletePatient(p.id)}
                                    className="text-xxs p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                    title="Delete patient record"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pagination control */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">
                      Page {patientsPagination.page} of {patientsPagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={patientsPagination.page <= 1}
                        onClick={() => fetchPatients(patientsPagination.page - 1)}
                        className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-teal-500/10 disabled:opacity-50 text-xs font-semibold"
                      >
                        Prev
                      </button>
                      <button
                        disabled={patientsPagination.page >= patientsPagination.totalPages}
                        onClick={() => fetchPatients(patientsPagination.page + 1)}
                        className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-teal-500/10 disabled:opacity-50 text-xs font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Form */}
              <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 h-fit">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                  New Registration
                </h3>

                {regMessage && (
                  <div className={`p-3 text-sm rounded-lg mb-4 ${regMessage.startsWith('Success') ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'}`}>
                    {regMessage}
                  </div>
                )}

                <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div>
                    <label className="block mb-1">Patient Full Name*</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Bruce Wayne"
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Age (Years)*</label>
                      <input
                        type="number"
                        required
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value)}
                        placeholder="35"
                        className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Gender*</label>
                      <select
  value={regGender}
  onChange={(e) => setRegGender(e.target.value)}
  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
>
  <option value="MALE">Male</option>
<option value="FEMALE">Female</option>
<option value="OTHER">Other</option>
</select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">Contact Phone*</label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="555-0199 (Unchecked format)"
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="bruce@wayne.com"
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Medical Anamnesis / History (Can be left blank)</label>
                    <textarea
                      value={regHistory}
                      onChange={(e) => setRegHistory(e.target.value)}
                      placeholder="E.g. cardiovascular risks, asthma..."
                      rows="3"
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="primary-btn w-full mt-2"
                  >
                    Register Patient Record
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: SCHEDULING / BOOKING & CHECKIN (RECEPTIONIST & ADMIN)
            ============================================================== */}
        {activeTab === 'book' && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Book Appointment Card */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                Schedule Appointment Slot
              </h3>

              {bookingMessage && (
                <div className={`p-3 text-sm rounded-lg mb-4 ${bookingMessage.startsWith('Success') ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'}`}>
                  {bookingMessage}
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div>
                  <label className="block mb-1">Select Registered Patient*</label>
                  <select
                    required
                    value={bookingPatientId}
                    onChange={(e) => setBookingPatientId(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phoneNumber})</option>
                    ))}
                  </select>
                  <span className="text-xxs text-slate-400 block mt-1">If client is missing, register them in the Directory tab first.</span>
                </div>

                <div>
                  <label className="block mb-1">Select Physician*</label>
                  <select
                    required
                    value={bookingDoctorId}
                    onChange={(e) => setBookingDoctorId(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  >
                    <option value="">-- Choose Physician --</option>
                    {doctorsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name} - {d.specialization} (${d.consultationFee})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Appointment Date & Time*</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Consultation Objective / Reason</label>
                  <input
                    type="text"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="Regular diagnostic review, suture removal..."
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="primary-btn w-full mt-2"
                >
                  Book Appointment Slot
                </button>
              </form>
            </div>

            {/* Quick Walkin Checkin Token Board */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-teal-600" />
                Active Direct Queue Check-In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                Generate an immediate waiting token for a direct walk-in patient. Allocates active positions under selected practitioners.
              </p>

              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-teal-500/25 bg-teal-500/10 text-slate-700 dark:text-slate-300 text-xs leading-5">
                  <strong>Token Generation Engine Note:</strong> Direct arrivals bypass appointments. The token engine automatically fetches the current days maximum token size and increments. 
                  <span className="block mt-1 font-bold uppercase tracking-wide text-[var(--text-muted)]">Note: token allocation is handled server-side.</span>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div>
                    <label className="block mb-1">Select Walk-in Patient*</label>
                    <select
                      id="walkin-patient"
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Assign Physician*</label>
                    <select
                      id="walkin-doctor"
                      className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    >
                      <option value="">-- Choose Physician --</option>
                      {doctorsList.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const pId = document.getElementById('walkin-patient').value;
                      const dId = document.getElementById('walkin-doctor').value;
                      if (!pId || !dId) {
                        alert('Select patient and doctor first');
                        return;
                      }
                      handleQueueCheckin(pId, dId);
                    }}
                    className="primary-btn w-full mt-2"
                  >
                    Generate Live Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: DOCTOR WORKLIST - APPOINTMENTS (DOCTOR ROLE)
            ============================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                Scheduled Daily Bookings List
              </h3>

              {doctorAppointments.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">No appointments scheduled for you today.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-widest text-xxs font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-3">Time</th>
                        <th className="pb-3">Patient</th>
                        <th className="pb-3">Consultation Reason</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {doctorAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5">
                            <button
                              onClick={() => setSelectedPatientHistory(app.patient)}
                              className="font-bold text-teal-600 hover:underline hover:text-teal-700 transition-colors"
                            >
                              {app.patient ? app.patient.name : 'Unknown Patient'}
                            </button>
                            <span className="block text-xxs text-slate-400 mt-0.5">Age: {app.patient?.age}</span>
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{app.reason || 'None provided'}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase ${app.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' : app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            {app.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    const matchedDoc = doctorsList.find(d => d.userId === user.id);
                                    handleQueueCheckin(app.patientId, matchedDoc.id, app.id);
                                  }}
                                  className="text-xxs px-2.5 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold hover:bg-teal-500 hover:text-white transition-colors"
                                >
                                  Check In Patient
                                </button>
                                <button
                                  onClick={() => handleCompleteAppointment(app.id)}
                                  className="text-xxs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-teal-500 hover:text-white transition-colors"
                                >
                                  Complete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Patient Clinical History Modal Display */}
            {selectedPatientHistory && (
              <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                      Medical Records: {selectedPatientHistory.name}
                    </h3>
                    <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Gender: {selectedPatientHistory.gender} | Contact: {selectedPatientHistory.phoneNumber}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedPatientHistory(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Clinical Background Information</h4>
                  
                  <p className="text-slate-700 dark:text-slate-300 leading-5 text-sm font-semibold">
                    {selectedPatientHistory.medicalHistory?.trim() || 'No clinical history recorded for this patient.'}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <Link 
                    href={`/patients/${selectedPatientHistory.id}/history-records`} 
                    className="text-teal-600 font-extrabold hover:underline flex items-center gap-1"
                  >
                    View Clinical Record
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            TAB: DOCTOR ACTIVE CALLING QUEUE (DOCTOR ROLE)
            ============================================================== */}
        {activeTab === 'queue' && (
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-teal-600" />
              Active Operations Queue Controller
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">
              Manage patient call sequences for live monitors. Update status from waiting to active calling.
            </p>

            {doctorQueue.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-sm">No checked-in patients in queue today.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctorQueue.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border shadow-md relative overflow-hidden flex flex-col justify-between ${t.status === 'CALLING' ? 'border-teal-500 bg-teal-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-500/5'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-100">Token #{t.tokenNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase ${t.status === 'CALLING' ? 'bg-teal-500 text-white' : t.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' : 'bg-amber-500/10 text-amber-500'}`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.patient.name}</h4>
                      <p className="text-xxs text-slate-400 mt-0.5">Contact: {t.patient.phoneNumber}</p>
                    </div>

                    <div className="mt-6 flex gap-2">
                      {t.status === 'WAITING' && (
                        <button
                          onClick={() => handleUpdateQueueStatus(t.id, 'CALLING')}
                          className="flex-1 py-1.5 bg-teal-600 text-white font-bold text-xxs rounded hover:bg-teal-700 transition-colors"
                        >
                          Call Patient
                        </button>
                      )}
                      {t.status === 'CALLING' && (
                        <>
                          <button
                            onClick={() => handleUpdateQueueStatus(t.id, 'COMPLETED')}
                            className="flex-1 py-1.5 bg-teal-600 text-white font-bold text-xxs rounded hover:bg-teal-700 transition-colors"
                          >
                            Consulted
                          </button>
                          <button
                            onClick={() => handleUpdateQueueStatus(t.id, 'SKIPPED')}
                            className="flex-1 py-1.5 bg-rose-500/10 text-rose-500 font-bold text-xxs rounded hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            Skip / No Show
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            TAB: SYSTEM REPORTS (ADMIN ROLE)
            ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    Doctor Revenue & Operations Report
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    System-wide practitioner performance overview. Summarizes completed bookings and revenue activity.
                  </p>
                </div>
                <button
                  onClick={generateSystemReport}
                  disabled={adminReportLoading}
                  className="glow-btn px-4 py-2 bg-teal-600 text-white font-extrabold text-xs rounded-lg shadow hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {adminReportLoading ? 'Loading...' : 'Load Operations Report'}
                </button>
              </div>

              {adminReportLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="pulse-loader">
                    <div></div>
                    <div></div>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-400 animate-pulse">
                    Preparing aggregated analytics for display...
                  </p>
                </div>
              ) : !adminReportData ? (
                  <div className="p-8 text-center bg-slate-100 dark:bg-slate-800/40 rounded-xl text-slate-400 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-700">
                  Click the button above to load the latest operations summary.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Reporting details benchmark */}
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 text-slate-700 dark:text-slate-300 text-xs rounded-lg border border-amber-500/20 leading-5">
                    <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <strong>Performance Summary:</strong> API execution resolved in{' '}
                      <span className="font-bold text-amber-500">{adminReportData.timeTakenMs} ms</span>. 
                      Aggregated database access keeps the report responsive under load.
                    </div>
                  </div>

                  {/* Summary widgets */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Total Physicians</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{adminReportData.data.length}</h4>
                    </div>
                    <div className="p-4 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Sum appointments</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                        {adminReportData.data.reduce((sum, item) => sum + item.totalAppointments, 0)}
                      </h4>
                    </div>
                    <div className="p-4 bg-slate-500/5 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Total Sales ($)</span>
                      <h4 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                        ${adminReportData.data.reduce((sum, item) => sum + item.revenue, 0)}
                      </h4>
                    </div>
                  </div>

                  {/* Table representation */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-widest text-xxs font-bold border-b border-slate-200 dark:border-slate-800">
                          <th className="pb-3">Doctor</th>
                          <th className="pb-3">Department</th>
                          <th className="pb-3 text-center">Consultations</th>
                          <th className="pb-3 text-center">Today Queue</th>
                          <th className="pb-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {adminReportData.data.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-500/5 transition-colors">
                            <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                              {item.name}
                              <span className="block text-xxs text-teal-600 dark:text-teal-400 font-semibold uppercase mt-0.5">{item.specialization}</span>
                            </td>
                            <td className="py-3.5 text-slate-500 dark:text-slate-400">{item.department}</td>
                            <td className="py-3.5 text-center text-slate-500 dark:text-slate-400">
                              {item.completedAppointments} Completed / {item.totalAppointments} Total
                            </td>
                            <td className="py-3.5 text-center font-bold text-slate-800 dark:text-slate-200">{item.todayQueueSize} in queue</td>
                            <td className="py-3.5 text-right font-bold text-teal-600 dark:text-teal-400">${item.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
          TAB: PHYSICIAN REGISTRY (ADMIN ROLE)
          ============================================================== */}
        {activeTab === 'physicians' && (
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-600" />
                Staff Physicians Registry Lookup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                AI-powered physician search and operational analytics.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1 rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  placeholder="Search physicians by name or specialization..."
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                  onClick={searchPhysiciansAdmin}
                  className="glow-btn px-5 py-2 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 font-bold text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-teal-400 transition-colors"
                >
                  Search Physicians
                </button>
            </div>
              <div className="p-3 bg-teal-500/10 text-teal-600 text-xs rounded-lg border border-teal-500/20 font-semibold leading-5 flex gap-3">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <div>
                  Real-time provider directory with secure search optimization.
                </div>
              </div>

            {/* Doctors Result List */}
            {doctorsList.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="mb-3">Physicians directory not loaded.</p>
                <button
                  onClick={() => { setSuppressInitialDoctorsLoad(false); fetchDoctorsDropdown(); }}
                  className="px-4 py-2 rounded bg-teal-600 text-white text-sm font-semibold"
                >
                  Refresh Physicians
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctorsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-500/5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-2">
                        {doc.department}
                      </span>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{doc.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{doc.specialization}</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>Exp: {doc.experience} yrs</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">Fee: ${doc.consultationFee}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
