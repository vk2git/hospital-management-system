import React, { useState, useEffect } from 'react';
import { getPatientAppointments, getAvailableDoctors, getAvailableTimeSlots, bookAppointment, cancelPatientAppointment, toggleAppointmentSharing } from '@/shared/api/api';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingMode, setBookingMode] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [shareMedicalSummary, setShareMedicalSummary] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startBooking = async () => {
    setBookingMode(true);
    setError('');
    try {
      const { data } = await getAvailableDoctors();
      setDoctors(data);
    } catch (err) {
      setError('Could not load doctors.');
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot('');
    if (selectedDoctor && date) {
      try {
        const { data } = await getAvailableTimeSlots(selectedDoctor, date);
        setAvailableSlots(data.time_slots || []);
      } catch (err) {
        setAvailableSlots([]);
      }
    }
  };

  const handleDoctorChange = async (e) => {
    const docId = e.target.value;
    setSelectedDoctor(docId);
    setSelectedSlot('');
    if (docId && selectedDate) {
      try {
        const { data } = await getAvailableTimeSlots(docId, selectedDate);
        setAvailableSlots(data.time_slots || []);
      } catch (err) {
        setAvailableSlots([]);
      }
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await bookAppointment({
        doctor_id: selectedDoctor,
        date: selectedDate,
        time_slot: selectedSlot,
        reason,
        share_medical_summary: shareMedicalSummary
      });
      setBookingMode(false);
      fetchAppointments();
      // Reset form
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedSlot('');
      setReason('');
      setShareMedicalSummary(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelPatientAppointment(id);
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      } catch (err) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-sys-color-primary)] mx-auto"></div></div>;
  }

  if (bookingMode) {
    return (
      <div className="bg-[var(--md-sys-color-surface)] rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">Book New Appointment</h2>
          <button onClick={() => setBookingMode(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleBook} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
            <select required value={selectedDoctor} onChange={handleDoctorChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none">
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.user_id}>Dr. {d.first_name} {d.last_name} ({d.specialization}) - ${d.consultation_fee}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input required type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={handleDateChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
            {selectedDoctor && selectedDate ? (
              availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {availableSlots.map(slot => (
                    <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${selectedSlot === slot ? 'bg-[var(--md-sys-color-primary)] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-[var(--md-sys-color-primary)]'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-2">No slots available for this date.</p>
              )
            ) : (
              <p className="text-sm text-gray-500 py-2">Please select a doctor and date first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit (Optional)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--md-sys-color-primary)] outline-none resize-none" placeholder="Briefly describe your symptoms or reason for visit"></textarea>
          </div>

          <div className="flex items-center gap-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
            <input 
              type="checkbox" 
              id="shareSummary" 
              checked={shareMedicalSummary} 
              onChange={e => setShareMedicalSummary(e.target.checked)} 
              className="w-5 h-5 text-[var(--md-sys-color-primary)] bg-white border-purple-300 rounded focus:ring-[var(--md-sys-color-primary)] cursor-pointer"
            />
            <label htmlFor="shareSummary" className="text-sm font-medium text-purple-900 cursor-pointer">Share AI-generated medical summary with doctor</label>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={!selectedSlot} className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${selectedSlot ? 'bg-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/90 shadow-md' : 'bg-gray-300 cursor-not-allowed'}`}>
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Appointments</h2>
          <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">Manage your upcoming and past appointments.</p>
        </div>
        <button onClick={startBooking} className="px-5 py-2.5 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Book Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Appointments</h3>
          <p className="text-gray-500 text-sm mb-6">You don't have any appointments scheduled.</p>
          <button onClick={startBooking} className="px-6 py-2 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] rounded-full font-medium">Book Now</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {appointments.map(appt => {
              const date = new Date(`${appt.date}T${appt.time_slot}`);
              const isPast = date < new Date() && appt.status !== 'cancelled';
              
              return (
                <li key={appt.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-xl p-3 text-center min-w-[70px]">
                      <div className="text-xs font-bold uppercase">{date.toLocaleDateString(undefined, { month: 'short' })}</div>
                      <div className="text-xl font-black">{date.getDate()}</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Dr. {appt.doctor_name}</h4>
                      <p className="text-sm text-gray-500 mb-1">{appt.specialization}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {appt.time_slot}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wide ${
                          appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'rescheduled' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                      {appt.reason && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded italic">"{appt.reason}"</p>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="flex items-center cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
                      <span className="mr-3 text-xs font-bold text-gray-700">AI Summary</span>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={appt.share_medical_summary}
                          onChange={async (e) => {
                            try {
                              await toggleAppointmentSharing(appt.id, e.target.checked);
                              fetchAppointments();
                              toast.success(`Summary sharing ${e.target.checked ? 'enabled' : 'disabled'}`);
                            } catch (err) {
                              toast.error('Failed to update sharing preference');
                            }
                          }}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${appt.share_medical_summary ? 'bg-[var(--md-sys-color-primary)]' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${appt.share_medical_summary ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>

                    {appt.status === 'scheduled' && !isPast && (
                      <button onClick={() => handleCancel(appt.id)} className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Appointments;
