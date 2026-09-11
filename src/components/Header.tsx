import React from 'react';
import {
  Cpu,
  RefreshCw,
  Wifi,
  WifiOff,
  Terminal,
  Compass,
  FileCheck2,
  DatabaseZap,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { syncService } from '../services/offlineSyncService';
import type { SyncTelemetry } from '../types/transit';

interface HeaderProps {
  currentTab: 'pipeline' | 'planner' | 'rules' | 'sync';
  onTabChange: (tab: 'pipeline' | 'planner' | 'rules' | 'sync') => void;
  telemetry: SyncTelemetry;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  onForceSync: () => void;
  onToggleOffline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  telemetry,
  isSimulatedOffline,
  isSyncing,
  onForceSync,
  onToggleOffline
}) => {
  const isOffline = isSimulatedOffline || (typeof navigator !== 'undefined' && !navigator.onLine);

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-50 bg-[#080c15]/95 backdrop-blur-md border-b border-[#1e293b] px-4 py-3 sm:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Brand & Tactical Sub-metrics */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div
              id="brand-logo-container"
              className="w-9 h-9 rounded bg-[#0f172a] border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff] shadow-[0_0_15px_-3px_rgba(0,229,255,0.3)]"
            >
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  id="system-brand-title"
                  className="font-bold text-base sm:text-lg tracking-tight text-white font-['Space_Grotesk']"
                >
                  Neural Transit <span className="text-[#00e5ff] font-mono text-sm tracking-wider font-semibold">ADK</span>
                </span>
                <span
                  id="system-status-badge"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                    isOffline
                      ? 'bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/30'
                      : 'bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-[#fbbf24]' : 'bg-[#34d399] animate-ping'}`} />
                  {isOffline ? 'OFFLINE CACHE' : 'DISPATCH ONLINE'}
                </span>
              </div>
              <p className="text-[11px] text-[#bac9cc] font-mono">
                Google ADK Railway Supervisor • Node/Python Sync Bridge
              </p>
            </div>
          </div>

          {/* Quick Mobile Offline Toggle */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              id="mobile-sync-btn"
              onClick={onForceSync}
              disabled={isSyncing || isOffline}
              className={`p-2 rounded border border-[#334155] text-[#bac9cc] hover:text-[#00e5ff] ${
                isSyncing ? 'animate-spin text-[#00e5ff]' : ''
              }`}
              title="Sync now with Python Engine"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="mobile-offline-toggle-btn"
              onClick={onToggleOffline}
              className={`p-2 rounded border text-xs font-mono flex items-center gap-1 ${
                isSimulatedOffline
                  ? 'bg-[#f59e0b]/20 border-[#f59e0b]/50 text-[#fbbf24]'
                  : 'bg-[#0f172a] border-[#334155] text-[#dae2fd]'
              }`}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-[#34d399]" />}
            </button>
          </div>
        </div>

        {/* Center: Tactical Navigation Tabs */}
        <nav
          id="main-nav-tabs"
          className="flex items-center bg-[#0b1326] p-1 rounded border border-[#1e293b] self-center md:self-auto overflow-x-auto w-full md:w-auto"
        >
          <button
            id="nav-tab-pipeline"
            onClick={() => onTabChange('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'pipeline'
                ? 'bg-[#171f33] text-[#00e5ff] border border-[#00e5ff]/30 shadow-sm font-semibold'
                : 'text-[#bac9cc] hover:text-[#dae2fd] hover:bg-[#131b2e]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Agent Pipeline</span>
          </button>

          <button
            id="nav-tab-planner"
            onClick={() => onTabChange('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'planner'
                ? 'bg-[#171f33] text-[#00e5ff] border border-[#00e5ff]/30 shadow-sm font-semibold'
                : 'text-[#bac9cc] hover:text-[#dae2fd] hover:bg-[#131b2e]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Travel Planner</span>
          </button>

          <button
            id="nav-tab-rules"
            onClick={() => onTabChange('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              currentTab === 'rules'
                ? 'bg-[#171f33] text-[#00e5ff] border border-[#00e5ff]/30 shadow-sm font-semibold'
                : 'text-[#bac9cc] hover:text-[#dae2fd] hover:bg-[#131b2e]'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>IRCTC Policy Matrix</span>
          </button>

          <button
            id="nav-tab-sync"
            onClick={() => onTabChange('sync')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors relative ${
              currentTab === 'sync'
                ? 'bg-[#171f33] text-[#00e5ff] border border-[#00e5ff]/30 shadow-sm font-semibold'
                : 'text-[#bac9cc] hover:text-[#dae2fd] hover:bg-[#131b2e]'
            }`}
          >
            <DatabaseZap className="w-3.5 h-3.5" />
            <span>Python Sync Engine</span>
            {telemetry.pending_count > 0 && (
              <span
                id="pending-mutations-badge"
                className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#f59e0b] text-[#080c15]"
              >
                {telemetry.pending_count}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Telemetry & Tactical Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Offline Simulator Pill Toggle */}
          <button
            id="btn-toggle-simulated-offline"
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono transition-all ${
              isSimulatedOffline
                ? 'bg-[#f59e0b]/15 border-[#f59e0b]/50 text-[#fbbf24] shadow-[0_0_12px_-2px_rgba(245,158,11,0.25)]'
                : 'bg-[#0f172a] border-[#334155] text-[#bac9cc] hover:border-[#00e5ff]/40 hover:text-white'
            }`}
            title="Simulate network disconnection to test offline booking queue"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-[#fbbf24]" /> : <Wifi className="w-3.5 h-3.5 text-[#34d399]" />}
            <span>{isSimulatedOffline ? 'OFFLINE ACTIVE' : 'ONLINE MODE'}</span>
          </button>

          {/* Sync status & force button */}
          <button
            id="btn-force-sync-header"
            onClick={onForceSync}
            disabled={isSyncing || isOffline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              isOffline
                ? 'bg-[#1e293b] text-[#849396] border border-[#334155] cursor-not-allowed'
                : 'bg-[#00e5ff] text-[#080c15] hover:bg-[#38bdf8] shadow-[0_0_15px_-3px_rgba(0,229,255,0.4)] active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCING...' : telemetry.pending_count > 0 ? `SYNC (${telemetry.pending_count})` : 'PYTHON SYNC'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
