import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AgentPipelineVisualizer } from './components/AgentPipelineVisualizer';
import { RailwayTravelPlanner } from './components/RailwayTravelPlanner';
import { IrctcComplianceMatrix } from './components/IrctcComplianceMatrix';
import { PythonSyncTerminal } from './components/PythonSyncTerminal';
import { BookingModal } from './components/BookingModal';
import { PnrTrackerModal } from './components/PnrTrackerModal';
import { syncService } from './services/offlineSyncService';
import type { Train, Booking } from './types/transit';
import {
  Terminal,
  Compass,
  FileCheck2,
  DatabaseZap,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'pipeline' | 'planner' | 'rules' | 'sync'>('planner');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(syncService.getSimulatedOfflineState());
  const [isSyncing, setIsSyncing] = useState<boolean>(syncService.getIsSyncing());
  const [telemetry, setTelemetry] = useState(syncService.getTelemetry());
  const [stations, setStations] = useState(syncService.getStations());
  const [trains, setTrains] = useState(syncService.getTrains());
  const [bookings, setBookings] = useState(syncService.getBookings());
  const [rules, setRules] = useState(syncService.getRules());
  const [mutationQueue, setMutationQueue] = useState(syncService.getMutationQueue());

  // Modal States
  const [bookingModalTrain, setBookingModalTrain] = useState<Train | null>(null);
  const [bookingModalClass, setBookingModalClass] = useState<string>('3A');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [pnrModalBooking, setPnrModalBooking] = useState<Booking | null>(null);
  const [pnrModalNumber, setPnrModalNumber] = useState<string>('');
  const [isPnrModalOpen, setIsPnrModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Subscribe to offline sync service
  useEffect(() => {
    const unsubscribe = syncService.subscribe(() => {
      setIsSimulatedOffline(syncService.getSimulatedOfflineState());
      setIsSyncing(syncService.getIsSyncing());
      setTelemetry(syncService.getTelemetry());
      setStations(syncService.getStations());
      setTrains(syncService.getTrains());
      setBookings(syncService.getBookings());
      setRules(syncService.getRules());
      setMutationQueue(syncService.getMutationQueue());
    });

    // Initial background sync if online
    if (!syncService.isEffectivelyOffline()) {
      syncService.syncWithPythonBackend().catch(() => {});
    }

    return () => unsubscribe();
  }, []);

  // Handlers
  const handleForceSync = async () => {
    const res = await syncService.syncWithPythonBackend();
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }
  };

  const handleToggleOffline = () => {
    const nowOffline = syncService.toggleSimulatedOffline();
    if (nowOffline) {
      showToast('Simulated Offline Mode Activated. Bookings will queue locally.', 'warning');
    } else {
      showToast('Online Mode Restored. Triggering Python Sync...', 'info');
    }
  };

  const handleOpenBookingModal = (train: Train, travelClass: string) => {
    setBookingModalTrain(train);
    setBookingModalClass(travelClass);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (data: any) => {
    const newBooking = syncService.createBooking(data);
    const isOffline = syncService.isEffectivelyOffline();
    showToast(
      isOffline
        ? `PNR ${newBooking.pnr} queued offline! Will sync seamlessly via Python.`
        : `PNR ${newBooking.pnr} issued and synced with backend!`,
      isOffline ? 'warning' : 'success'
    );
  };

  const handleCancelBooking = (pnr: string) => {
    syncService.cancelBooking(pnr);
    showToast(`TDR Filed for PNR ${pnr}. Marked for cancellation.`, 'info');
  };

  const handleOpenPnrModal = (pnr: string) => {
    const found = bookings.find(b => b.pnr === pnr);
    setPnrModalBooking(found || null);
    setPnrModalNumber(pnr);
    setIsPnrModalOpen(true);
  };

  const handleToggleRule = (ruleId: string) => {
    syncService.toggleRulePolicy(ruleId);
    showToast(`Rule ${ruleId} enforcement updated. Queued for Python sync.`, 'info');
  };

  const handleDownloadOfflinePack = async () => {
    const ok = await syncService.fetchOfflinePack();
    if (ok) {
      showToast('Full Offline Timetable & IRCTC Heuristics Pack cached locally!', 'success');
    } else {
      showToast('Failed to download offline pack from server.', 'warning');
    }
  };

  const handleResetServer = async () => {
    await syncService.resetServerAndLocal();
    showToast('Database reset to mission-critical factory baseline.', 'info');
  };

  const handleInjectTestConflict = () => {
    // Deliberately trigger a race condition on a full train to test 3-way semantic resolution
    const train = trains.find(t => t.id === '12952') || trains[0];
    syncService.createBooking({
      train_id: train.id,
      travel_class: '3A', // already at WL-12
      passenger_name: 'Concurrent Agent Test',
      age: 28,
      gender: 'M',
      preferred_berth: 'B1-12 (Lower)',
      date: '2026-09-22',
      from_code: train.from_code,
      to_code: train.to_code
    });
    showToast('Injected concurrent booking contention. Python 3-way resolver engaged!', 'warning');
  };

  return (
    <div id="neural-transit-application" className="min-h-screen bg-[#080c15] text-[#dae2fd] flex flex-col font-['Inter']">
      {/* Tactical Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        telemetry={telemetry}
        isSimulatedOffline={isSimulatedOffline}
        isSyncing={isSyncing}
        onForceSync={handleForceSync}
        onToggleOffline={handleToggleOffline}
      />

      {/* Main Container */}
      <main id="main-content-viewport" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 md:pb-8">
        {currentTab === 'pipeline' && <AgentPipelineVisualizer />}

        {currentTab === 'planner' && (
          <RailwayTravelPlanner
            trains={trains}
            stations={stations}
            bookings={bookings}
            onOpenBookingModal={handleOpenBookingModal}
            onOpenPnrModal={handleOpenPnrModal}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {currentTab === 'rules' && (
          <IrctcComplianceMatrix
            rules={rules}
            onToggleRule={handleToggleRule}
          />
        )}

        {currentTab === 'sync' && (
          <PythonSyncTerminal
            telemetry={telemetry}
            mutationQueue={mutationQueue}
            isOffline={syncService.isEffectivelyOffline()}
            isSyncing={isSyncing}
            onForceSync={handleForceSync}
            onDownloadOfflinePack={handleDownloadOfflinePack}
            onResetServer={handleResetServer}
            onInjectTestConflict={handleInjectTestConflict}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080c15]/95 backdrop-blur-md border-t border-[#1e293b] px-2 py-2 flex items-center justify-around"
      >
        <button
          id="mobile-nav-pipeline"
          onClick={() => setCurrentTab('pipeline')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[64px] min-h-[44px] justify-center ${
            currentTab === 'pipeline' ? 'text-[#00e5ff]' : 'text-[#849396]'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[10px] font-mono">Pipeline</span>
        </button>

        <button
          id="mobile-nav-planner"
          onClick={() => setCurrentTab('planner')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[64px] min-h-[44px] justify-center ${
            currentTab === 'planner' ? 'text-[#00e5ff]' : 'text-[#849396]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-mono">Planner</span>
        </button>

        <button
          id="mobile-nav-rules"
          onClick={() => setCurrentTab('rules')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[64px] min-h-[44px] justify-center ${
            currentTab === 'rules' ? 'text-[#00e5ff]' : 'text-[#849396]'
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="text-[10px] font-mono">Rules</span>
        </button>

        <button
          id="mobile-nav-sync"
          onClick={() => setCurrentTab('sync')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[64px] min-h-[44px] justify-center relative ${
            currentTab === 'sync' ? 'text-[#00e5ff]' : 'text-[#849396]'
          }`}
        >
          <DatabaseZap className="w-5 h-5" />
          <span className="text-[10px] font-mono">Sync</span>
          {mutationQueue.length > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#f59e0b]" />
          )}
        </button>
      </nav>

      {/* Booking Modal */}
      <BookingModal
        train={bookingModalTrain}
        travelClass={bookingModalClass}
        isOpen={isBookingModalOpen}
        isOffline={syncService.isEffectivelyOffline()}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* PNR Tracker Modal */}
      <PnrTrackerModal
        pnr={pnrModalNumber}
        booking={pnrModalBooking}
        isOpen={isPnrModalOpen}
        onClose={() => setIsPnrModalOpen(false)}
      />

      {/* Floating Tactical Toast */}
      {toastMessage && (
        <div
          id="system-tactical-toast"
          className={`fixed bottom-16 md:bottom-6 right-4 z-50 max-w-sm p-3.5 rounded border shadow-2xl flex items-start gap-2.5 animate-in slide-in-from-bottom-3 duration-200 font-mono text-xs ${
            toastMessage.type === 'success'
              ? 'bg-[#0f172a] border-[#10b981] text-[#34d399]'
              : toastMessage.type === 'warning'
              ? 'bg-[#0f172a] border-[#f59e0b] text-[#fbbf24]'
              : 'bg-[#0f172a] border-[#00e5ff] text-[#00e5ff]'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-[#10b981] mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#f59e0b] mt-0.5" />
          )}
          <div className="flex-1">{toastMessage.text}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#849396] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
