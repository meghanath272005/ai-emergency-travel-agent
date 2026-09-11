import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import type { Train } from '../types/transit';

interface BookingModalProps {
  train: Train | null;
  travelClass: string;
  isOpen: boolean;
  isOffline: boolean;
  onClose: () => void;
  onConfirmBooking: (data: {
    train_id: string;
    travel_class: string;
    passenger_name: string;
    age: number;
    gender: 'M' | 'F' | 'O';
    preferred_berth: string;
    date: string;
    from_code: string;
    to_code: string;
  }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  train,
  travelClass,
  isOpen,
  isOffline,
  onClose,
  onConfirmBooking
}) => {
  if (!isOpen || !train) return null;

  const [passengerName, setPassengerName] = useState('Sarah Vance');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<'M' | 'F' | 'O'>('F');
  const [berthPref, setBerthPref] = useState('B2-14 (Lower)');
  const [travelDate, setTravelDate] = useState('2026-09-22');

  const classInfo = train.classes[travelClass] || Object.values(train.classes)[0];
  const fare = classInfo?.fare || 2400;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmBooking({
      train_id: train.id,
      travel_class: travelClass,
      passenger_name: passengerName,
      age: Number(age),
      gender,
      preferred_berth: berthPref,
      date: travelDate,
      from_code: train.from_code,
      to_code: train.to_code
    });
    onClose();
  };

  return (
    <div
      id="booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="booking-modal-container"
        className="w-full max-w-lg bg-[#0f172a] rounded border border-[#00e5ff]/40 p-5 sm:p-6 space-y-4 shadow-[0_0_40px_-10px_rgba(0,229,255,0.25)] relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00e5ff]">
                IRCTC SEAT RESERVATION GATEWAY
              </span>
              {isOffline && (
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40">
                  OFFLINE QUEUE ENABLED
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              {train.id} {train.name}
            </h3>
          </div>
          <button
            id="btn-close-booking-modal"
            onClick={onClose}
            className="p-1 rounded text-[#849396] hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Train & Class Snapshot */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded bg-[#0b1326] border border-[#1e293b] text-xs font-mono">
          <div>
            <div className="text-[#849396]">CLASS</div>
            <div className="text-white font-bold">{travelClass}</div>
          </div>
          <div>
            <div className="text-[#849396]">STATUS</div>
            <div className="text-[#34d399] font-bold">{classInfo?.status}</div>
          </div>
          <div>
            <div className="text-[#849396]">TOTAL FARE</div>
            <div className="text-[#00e5ff] font-bold">₹{fare}</div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#849396] uppercase">PASSENGER FULL NAME</label>
            <input
              id="input-passenger-name"
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#849396] uppercase">AGE</label>
              <input
                id="input-passenger-age"
                type="number"
                min="5"
                max="110"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#849396] uppercase">GENDER</label>
              <select
                id="select-passenger-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none cursor-pointer"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="O">Other (O)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#849396] uppercase">BERTH PREFERENCE</label>
              <select
                id="select-berth-pref"
                value={berthPref}
                onChange={(e) => setBerthPref(e.target.value)}
                className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none cursor-pointer"
              >
                <option value="B1-12 (Lower)">Lower Berth (LB)</option>
                <option value="B1-14 (Middle)">Middle Berth (MB)</option>
                <option value="B1-18 (Upper)">Upper Berth (UB)</option>
                <option value="B1-21 (Side Lower)">Side Lower (SL)</option>
                <option value="B1-22 (Side Upper)">Side Upper (SU)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#849396] uppercase">DATE OF JOURNEY</label>
              <input
                id="input-booking-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>
          </div>

          {/* Offline Sync Reassurance Notice */}
          <div className="p-3 rounded bg-[#0b1326] border border-[#1e293b] text-[11px] text-[#bac9cc] space-y-1">
            <div className="flex items-center gap-1.5 text-[#00e5ff] font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />
              <span>Offline-First Vector Clock Persistence</span>
            </div>
            <p>
              {isOffline
                ? 'Your booking will be committed to the offline mutation queue. When connection is restored, the Python sync engine will seamlessly reconcile seat quotas and verify chart integrity.'
                : 'Directly synchronized with backend database and audited against IRCTC Tatkal anti-concurrency rules.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-cancel-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-mono text-[#849396] hover:text-white transition-colors"
            >
              DISMISS
            </button>
            <button
              id="btn-confirm-reservation"
              type="submit"
              className="px-5 py-2.5 rounded bg-[#00e5ff] hover:bg-[#38bdf8] text-[#080c15] font-mono text-xs font-bold transition-all shadow-[0_0_15px_-3px_rgba(0,229,255,0.4)]"
            >
              CONFIRM RESERVATION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
