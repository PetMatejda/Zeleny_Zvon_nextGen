'use client';

import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { getAvailableSlots, requestBooking } from '../app/actions/reservations';
import 'react-day-picker/dist/style.css';

export default function ReservationCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      getAvailableSlots(dateStr).then((slots) => {
        setAvailableSlots(slots);
        setLoadingSlots(false);
      });
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setMessage(null);

    const result = await requestBooking({
      name: formData.name,
      email: formData.email,
      slotId: selectedSlot.id
    });

    setSubmitting(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Rezervace úspěšně odeslána ke schválení. Budete informováni e-mailem.' });
      setFormData({ name: '', email: '' });
      setSelectedSlot(null);
      setSelectedDate(null);
    } else {
      setMessage({ type: 'error', text: result.error || 'Došlo k chybě.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl flex flex-col md:flex-row gap-8">
      {/* Calendar Section */}
      <div className="flex-1">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Vyberte datum</h2>
        <div className="p-4 bg-gray-50 rounded-xl inline-block shadow-inner">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={cs}
            disabled={[{ before: new Date() }]}
            className="font-sans"
            modifiersClassNames={{
              selected: 'bg-green-600 text-white rounded-full',
              today: 'text-green-600 font-bold'
            }}
          />
        </div>
      </div>

      {/* Slots & Form Section */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Termín a údaje</h2>
        
        {!selectedDate ? (
          <p className="text-gray-500 italic">Nejprve vyberte datum v kalendáři.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Slots */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Dostupné termíny pro {format(selectedDate, 'd. MMMM yyyy', { locale: cs })}:</h3>
              {loadingSlots ? (
                <div className="animate-pulse flex gap-2 flex-wrap">
                  {[1,2].map(i => <div key={i} className="h-16 w-full bg-gray-200 rounded-lg"></div>)}
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-red-500 font-medium">Pro tento den už nejsou žádné volné termíny.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${
                        selectedSlot?.id === slot.id 
                          ? 'border-green-600 bg-green-50 shadow-md ring-1 ring-green-600' 
                          : 'border-gray-200 hover:border-green-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                            <div className="font-bold text-gray-900">{slot.title}</div>
                            <div className="text-sm text-gray-600">{slot.timeSlot}</div>
                        </div>
                        <div className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {slot.availableSpots} volných míst
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Form */}
            {selectedSlot && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
                    Vybráno: <strong>{selectedSlot.title}</strong> v <strong>{selectedSlot.timeSlot}</strong>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jméno a příjmení</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Jan Novák"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="jan.novak@email.cz"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin inline-block w-5 h-5 border-[3px] border-white border-t-transparent rounded-full"></span>
                  ) : 'Odeslat žádost o rezervaci'}
                </button>
              </form>
            )}

            {message && (
              <div className={`p-4 rounded-lg mt-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
