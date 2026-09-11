import React from 'react';
import { X, CheckCircle2, AlertCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';
import type { Booking } from '../types/transit';

interface PnrTrackerModalProps {
  pnr: string;
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PnrTrackerModal: React.FC<PnrTrackerModalProps> = ({
  pnr,
  booking,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const sampleBooking: Booking = booking || {
    pnr: pnr || '241-8930129',
    train_id: '12952',
    train_name: 'Mumbai Tejas Rajdhani',
    from_code: 'NDLS',
    to_code: 'BCT',
    date: '2026-09-22',
    travel_class: '2A',
    passengers: [
      { name: 'Dr. Sarah Vance', age: 34, gender: 'F', berth: 'B1-21 (Lower)', status: 'CNF', quota: 'GN' }
    ],
    current_status: 'CNF / B1-21',
    booking_status: 'WL-4',
    chart_prepared: true,
    conf_prob: 100,
    fare: 2980,
    timestamp: Date.now() - 43200000,
    vector_clock: { server: 95 }
  };

  const isCnf = sampleBooking.current_status.includes('CNF');

  return (
    <div
      id="pnr-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="pnr-modal-container"
        className="w-full max-w-xl bg-[#0f172a] rounded border border-[#00e5ff]/40 p-5 sm:p-6 space-y-4 shadow-[0_0_40px_-10px_rgba(0,229,255,0.25)] relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00e5ff]">
                PASSENGER NAME RECORD (PNR) INSPECTOR
              </span>
              <span
                className={`px-2 py-0.2 rounded text-[10px] font-mono ${
                  sampleBooking.chart_prepared
                    ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40'
                    : 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40'
                }`}
              >
                {sampleBooking.chart_prepared ? 'CHART PREPARED' : 'CHARTING IN PROGRESS'}
              </span>
            </div>
            <h3 className="text-xl font-bold font-mono text-white tracking-wider">
              {sampleBooking.pnr}
            </h3>
          </div>
          <button
            id="btn-close-pnr-modal"
            onClick={onClose}
            className="p-1 rounded text-[#849396] hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route & Train Details */}
        <div className="p-3.5 rounded bg-[#0b1326] border border-[#1e293b] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold">
              {sampleBooking.train_id} {sampleBooking.train_name}
            </span>
            <span className="text-[#38bdf8]">Class: {sampleBooking.travel_class}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#849396]">
            <span>{sampleBooking.from_code} → {sampleBooking.to_code}</span>
            <span>Date: {sampleBooking.date}</span>
            <span className="text-white">₹{sampleBooking.fare}</span>
          </div>
        </div>

        {/* Passenger Status Matrix */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#849396] uppercase">PASSENGER STATUS DETAILS</div>
          <div className="rounded border border-[#1e293b] overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead className="bg-[#171f33] text-[#bac9cc]">
                <tr>
                  <th className="p-2 text-left">PASSENGER</th>
                  <th className="p-2 text-left">BOOKING STATUS</th>
                  <th className="p-2 text-left">CURRENT STATUS</th>
                  <th className="p-2 text-right">CONF. PROB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] bg-[#0b1326]">
                {sampleBooking.passengers.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#131b2e]">
                    <td className="p-2 text-white font-semibold">
                      {p.name} ({p.age}, {p.gender})
                    </td>
                    <td className="p-2 text-[#849396]">{sampleBooking.booking_status}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          isCnf ? 'bg-[#10b981]/20 text-[#34d399]' : 'bg-[#f59e0b]/20 text-[#fbbf24]'
                        }`}
                      >
                        {sampleBooking.current_status}
                      </span>
                    </td>
                    <td className="p-2 text-right text-[#00e5ff] font-bold">
                      {sampleBooking.conf_prob}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coach Positioning Diagram */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#849396]">
            <span>COACH POSITIONING ARCHITECTURE</span>
            <span className="text-[#38bdf8]">RAKE: LHB HIGH-SPEED</span>
          </div>

          <div className="p-3 rounded bg-[#080c15] border border-[#1e293b] overflow-x-auto flex items-center gap-1.5 py-4">
            <div className="px-2.5 py-1.5 rounded bg-[#334155] text-[10px] font-mono text-white whitespace-nowrap">
              LOCO 🚂
            </div>
            {['EOG', 'B1', 'B2', 'B3', 'B4', 'A1', 'H1', 'PC', 'S1', 'SLR'].map((coach) => {
              const isTargetCoach = coach === 'B1';
              return (
                <div
                  key={coach}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-mono text-center min-w-[42px] transition-all ${
                    isTargetCoach
                      ? 'bg-[#00e5ff] text-[#080c15] font-extrabold border-2 border-white shadow-[0_0_15px_rgba(0,229,255,0.6)]'
                      : 'bg-[#171f33] text-[#bac9cc] border border-[#1e293b]'
                  }`}
                >
                  {coach}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-[#849396] text-center">
            * Passenger allocated in Coach B1 (Near platform center escalator)
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            id="btn-dismiss-pnr-modal"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#334155] text-white font-mono text-xs transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
