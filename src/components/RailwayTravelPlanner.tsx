import React, { useState } from 'react';
import {
  Search,
  ArrowLeftRight,
  Calendar,
  Train as TrainIcon,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Ticket,
  Users,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import type { Train, Station, Booking, ClassAvailability } from '../types/transit';

interface RailwayTravelPlannerProps {
  trains: Train[];
  stations: Station[];
  bookings: Booking[];
  onOpenBookingModal: (train: Train, travelClass: string) => void;
  onOpenPnrModal: (pnr: string) => void;
  onCancelBooking: (pnr: string) => void;
}

export const RailwayTravelPlanner: React.FC<RailwayTravelPlannerProps> = ({
  trains,
  stations,
  bookings,
  onOpenBookingModal,
  onOpenPnrModal,
  onCancelBooking
}) => {
  const [fromStation, setFromStation] = useState<string>('NDLS');
  const [toStation, setToStation] = useState<string>('BCT');
  const [travelDate, setTravelDate] = useState<string>('2026-09-22');
  const [selectedQuota, setSelectedQuota] = useState<string>('GN');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchPnrInput, setSearchPnrInput] = useState<string>('');

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Filter trains matching search or show high-speed corridor trains
  const filteredTrains = trains.filter(train => {
    // If exact match
    if (train.from_code === fromStation && train.to_code === toStation) return true;
    // Or if connected via route stops
    const stops = [train.from_code, ...train.route_stops, train.to_code];
    const fromIdx = stops.indexOf(fromStation);
    const toIdx = stops.indexOf(toStation);
    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
  });

  const displayTrains = filteredTrains.length > 0 ? filteredTrains : trains;

  return (
    <div id="railway-planner-view" className="space-y-6">
      {/* Top Section: Search Terminal & PNR Lookup */}
      <div
        id="planner-search-panel"
        className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-6 space-y-4 backdrop-blur-md shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Space_Grotesk'] flex items-center gap-2">
              <TrainIcon className="w-5 h-5 text-[#00e5ff]" />
              IRCTC Transit Route & Quota Intelligence
            </h2>
            <p className="text-xs text-[#bac9cc] font-['Inter']">
              Autonomous search, dynamic fare estimation, and ML-backed waitlist confirmation curves.
            </p>
          </div>

          {/* Quick PNR Search Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              id="input-quick-pnr-lookup"
              type="text"
              placeholder="Track PNR (e.g. 241-8930129)"
              value={searchPnrInput}
              onChange={(e) => setSearchPnrInput(e.target.value)}
              className="bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-1.5 text-xs font-mono text-white placeholder:text-[#849396] outline-none w-full sm:w-56 transition-colors"
            />
            <button
              id="btn-search-pnr"
              onClick={() => {
                if (searchPnrInput) onOpenPnrModal(searchPnrInput);
              }}
              className="px-3 py-1.5 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#334155] text-[#00e5ff] text-xs font-mono font-medium transition-colors"
            >
              TRACK
            </button>
          </div>
        </div>

        {/* Route Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Origin */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#849396] uppercase">ORIGIN STATION</label>
            <select
              id="select-from-station"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none cursor-pointer"
            >
              {stations.map(st => (
                <option key={st.code} value={st.code} className="bg-[#0f172a] text-white">
                  {st.code} - {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Stations Button (centered on desktop) */}
          <div className="hidden lg:flex items-center justify-center pb-1">
            <button
              id="btn-swap-stations"
              onClick={swapStations}
              className="p-2 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#334155] text-[#00e5ff] transition-colors"
              title="Swap Origin and Destination"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#849396] uppercase">DESTINATION STATION</label>
            <select
              id="select-to-station"
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none cursor-pointer"
            >
              {stations.map(st => (
                <option key={st.code} value={st.code} className="bg-[#0f172a] text-white">
                  {st.code} - {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#849396] uppercase">JOURNEY DATE</label>
            <div className="relative">
              <input
                id="input-travel-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none"
              />
            </div>
          </div>

          {/* Quota */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#849396] uppercase">IRCTC QUOTA</label>
            <select
              id="select-quota"
              value={selectedQuota}
              onChange={(e) => setSelectedQuota(e.target.value)}
              className="w-full bg-[#080c15] border border-[#1e293b] focus:border-[#00e5ff] rounded px-3 py-2 text-xs font-mono text-white outline-none cursor-pointer"
            >
              <option value="GN">GENERAL QUOTA (GN)</option>
              <option value="TQ">TATKAL AC (TQ)</option>
              <option value="PT">PREMIUM TATKAL (PT)</option>
              <option value="LD">LADIES QUOTA (LD)</option>
            </select>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e293b]">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-[#849396] mr-1">CLASS:</span>
            {['ALL', '1A', '2A', '3A', 'EC', 'CC', 'SL'].map(cls => (
              <button
                key={cls}
                id={`btn-filter-class-${cls}`}
                onClick={() => setClassFilter(cls)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  classFilter === cls
                    ? 'bg-[#00e5ff] text-[#080c15] font-bold shadow-sm'
                    : 'bg-[#171f33] text-[#bac9cc] hover:text-white border border-[#1e293b]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-[#38bdf8]">
            {displayTrains.length} CANDIDATE TRAINS INDEXED
          </span>
        </div>
      </div>

      {/* ADK Smart Branching Node Suggestion Banner */}
      <div
        id="adk-smart-branching-banner"
        className="bg-[#0b1326] rounded border border-[#00e5ff]/30 p-4 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_-5px_rgba(0,229,255,0.15)]"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00e5ff] tracking-wider uppercase">
                ADK Autonomous Multi-Hop Route Optimization
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                99.2% CONFIRMATION ESTIMATE
              </span>
            </div>
            <p className="text-xs text-[#dae2fd] font-['Inter']">
              Direct <span className="text-white font-semibold">12952 (3A)</span> is Waitlisted (<span className="text-[#f59e0b] font-mono">WL-12</span>). Split ticket via <span className="text-[#00e5ff] font-semibold">KOTA Junction</span> guarantees 2 consecutive confirmed berths with only 35m platform transfer!
            </p>
          </div>
        </div>

        <button
          id="btn-apply-split-route"
          onClick={() => {
            const t = trains.find(tr => tr.id === '12952') || trains[0];
            onOpenBookingModal(t, '2A');
          }}
          className="px-3.5 py-2 rounded bg-[#00e5ff] hover:bg-[#38bdf8] text-[#080c15] font-mono text-xs font-bold whitespace-nowrap shadow-sm transition-all"
        >
          AUTOROUTE SPLIT
        </button>
      </div>

      {/* Train Candidate Cards List */}
      <div className="space-y-4">
        {displayTrains.map((train) => {
          return (
            <div
              key={train.id}
              id={`train-card-${train.id}`}
              className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-4 hover:border-[#334155] transition-all relative group"
            >
              {/* Header: Train Number, Name, Type, Speed */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base sm:text-lg font-bold font-mono text-[#00e5ff] tracking-wider">
                    {train.id}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                      {train.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#849396]">
                      <span>{train.type}</span>
                      <span>•</span>
                      <span className="text-[#38bdf8]">{train.speed_kmh} km/h</span>
                      <span>•</span>
                      <span className="text-[#34d399]">{train.punctuality_pct}% Punctuality</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  {train.tatkal_open && (
                    <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                      TATKAL OPEN
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#bac9cc]">
                    DYNAMIC 1.{Math.round((train.dynamic_pricing_factor - 1) * 100)}X
                  </span>
                </div>
              </div>

              {/* Schedule Timeline */}
              <div className="grid grid-cols-3 gap-2 items-center text-center sm:text-left py-1">
                {/* Origin */}
                <div>
                  <div className="text-xl font-bold font-mono text-white">{train.departure}</div>
                  <div className="text-xs font-semibold text-[#00e5ff] font-mono">{train.from_code}</div>
                  <div className="text-[11px] text-[#849396] font-['Inter']">Origin Station</div>
                </div>

                {/* Duration Line */}
                <div className="text-center space-y-1">
                  <div className="text-xs font-mono text-[#bac9cc] flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00e5ff]" />
                    {train.duration}
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="w-full h-0.5 bg-[#1e293b]" />
                    <div className="absolute w-2 h-2 rounded-full bg-[#00e5ff]" />
                  </div>
                  <div className="text-[10px] font-mono text-[#849396]">
                    {train.route_stops.length} Stoppages
                  </div>
                </div>

                {/* Destination */}
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-white">{train.arrival}</div>
                  <div className="text-xs font-semibold text-[#00e5ff] font-mono">{train.to_code}</div>
                  <div className="text-[11px] text-[#849396] font-['Inter']">Terminal Station</div>
                </div>
              </div>

              {/* Class Availability Matrix Chips */}
              <div className="space-y-1.5 pt-2 border-t border-[#1e293b]">
                <div className="text-[11px] font-mono text-[#849396]">SELECT CLASS & BERTH:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {(Object.entries(train.classes) as [string, ClassAvailability][])
                    .filter(([cls]) => classFilter === 'ALL' || classFilter === cls)
                    .map(([cls, info]) => {
                      const isAvailable = info.available > 0;
                      return (
                        <div
                          key={cls}
                          id={`class-card-${train.id}-${cls}`}
                          onClick={() => onOpenBookingModal(train, cls)}
                          className={`p-2.5 rounded cursor-pointer transition-all border flex flex-col justify-between ${
                            isAvailable
                              ? 'bg-[#0b1326] border-[#10b981]/40 hover:border-[#10b981] hover:bg-[#10b981]/5'
                              : 'bg-[#0b1326] border-[#f59e0b]/40 hover:border-[#f59e0b] hover:bg-[#f59e0b]/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-white">{cls}</span>
                            <span className="text-xs font-mono text-[#dae2fd]">₹{info.fare}</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className={`text-[11px] font-mono font-semibold ${
                                isAvailable ? 'text-[#34d399]' : 'text-[#fbbf24]'
                              }`}
                            >
                              {info.status}
                            </span>
                            <span className="text-[10px] font-mono text-[#849396]">
                              {info.conf_prob}% CONF
                            </span>
                          </div>

                          <button
                            id={`btn-book-${train.id}-${cls}`}
                            className="mt-2 w-full py-1 text-[10px] font-mono font-bold rounded bg-[#171f33] hover:bg-[#00e5ff] hover:text-[#080c15] text-[#00e5ff] transition-colors"
                          >
                            RESERVE
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Passenger Itineraries (Offline & Local) */}
      <div
        id="active-passenger-itineraries"
        className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#00e5ff]" />
            <h3 className="font-bold text-sm text-white font-['Space_Grotesk'] uppercase tracking-wider">
              Issued Itineraries & PNR Registry ({bookings.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#849396]">
            OFFLINE-CAPABLE RESERVATION STORAGE
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-[#849396]">
            No issued tickets found in current session. Book any train berth above to create an offline/synced itinerary.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.pnr}
                id={`booking-card-${booking.pnr}`}
                className="bg-[#0b1326] rounded border border-[#1e293b] p-3.5 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00e5ff]">
                      PNR: {booking.pnr}
                    </span>
                    {booking.offline_pending && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40">
                        OFFLINE QUEUED
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      booking.current_status.includes('CNF')
                        ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                        : booking.current_status.includes('CANCELLED')
                        ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30'
                        : 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30'
                    }`}
                  >
                    {booking.current_status}
                  </span>
                </div>

                <div className="text-xs text-white font-semibold">
                  {booking.train_id} {booking.train_name} ({booking.travel_class})
                </div>

                <div className="text-[11px] font-mono text-[#849396] flex items-center justify-between">
                  <span>{booking.from_code} → {booking.to_code} | {booking.date}</span>
                  <span className="text-white font-semibold">₹{booking.fare}</span>
                </div>

                {booking.passengers && booking.passengers[0] && (
                  <div className="text-[11px] text-[#bac9cc] pt-1 border-t border-[#1e293b]">
                    Passenger: {booking.passengers[0].name} ({booking.passengers[0].berth})
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    id={`btn-track-booking-${booking.pnr}`}
                    onClick={() => onOpenPnrModal(booking.pnr)}
                    className="px-2.5 py-1 text-[10px] font-mono rounded bg-[#171f33] hover:bg-[#222a3d] text-[#00e5ff] border border-[#334155]"
                  >
                    COACH CHART
                  </button>

                  {!booking.current_status.includes('CANCELLED') && (
                    <button
                      id={`btn-cancel-booking-${booking.pnr}`}
                      onClick={() => onCancelBooking(booking.pnr)}
                      className="px-2.5 py-1 text-[10px] font-mono rounded bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] border border-[#f43f5e]/40"
                    >
                      FILE TDR / CANCEL
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
