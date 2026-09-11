import React, { useState } from 'react';
import {
  DatabaseZap,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Code2,
  FileDown,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowDownUp
} from 'lucide-react';
import type { SyncTelemetry, MutationRecord, ConflictRecord } from '../types/transit';

interface PythonSyncTerminalProps {
  telemetry: SyncTelemetry;
  mutationQueue: MutationRecord[];
  isOffline: boolean;
  isSyncing: boolean;
  onForceSync: () => void;
  onDownloadOfflinePack: () => void;
  onResetServer: () => void;
  onInjectTestConflict: () => void;
}

export const PythonSyncTerminal: React.FC<PythonSyncTerminalProps> = ({
  telemetry,
  mutationQueue,
  isOffline,
  isSyncing,
  onForceSync,
  onDownloadOfflinePack,
  onResetServer,
  onInjectTestConflict
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'queue' | 'conflicts' | 'code'>('telemetry');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleDownload = () => {
    onDownloadOfflinePack();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div id="python-sync-terminal-view" className="space-y-6">
      {/* Top Banner: Python Engine Status Deck */}
      <div
        id="sync-engine-banner"
        className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-3 backdrop-blur-md"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">
                <DatabaseZap className="w-3.5 h-3.5" />
                PYTHON 3.10 SYNC ENGINE V2.4
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.2 rounded-full border ${
                  isOffline
                    ? 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30'
                    : 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30'
                }`}
              >
                {isOffline ? 'OFFLINE MUTATION LOGGING' : 'LIVE BIDIRECTIONAL SYNC'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              Seamless Python Synchronization & Vector Clock Engine
            </h2>
            <p className="text-xs text-[#bac9cc] max-w-2xl font-['Inter']">
              Executes Python backend reconciliation (<code className="text-[#38bdf8] font-mono">sync_engine.py</code>)
              for 3-way semantic merge, ticket quota concurrency resolution, vector clock monotonicity, and offline queue commits.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-trigger-python-sync"
              onClick={onForceSync}
              disabled={isSyncing || isOffline}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold transition-all ${
                isOffline
                  ? 'bg-[#1e293b] text-[#849396] border border-[#334155] cursor-not-allowed'
                  : 'bg-[#00e5ff] text-[#080c15] hover:bg-[#38bdf8] shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)] active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'SYNCHRONIZING...' : 'EXECUTE PYTHON SYNC'}</span>
            </button>

            <button
              id="btn-download-offline-pack"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#334155] text-xs font-mono text-[#00e5ff] transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'PACK CACHED!' : 'OFFLINE DATA PACK'}</span>
            </button>

            <button
              id="btn-inject-race-conflict"
              onClick={onInjectTestConflict}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/40 text-xs font-mono text-[#fbbf24] transition-colors"
              title="Inject concurrent reservation mutation to trigger Python 3-way semantic resolution"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>TEST CONCURRENCY RACE</span>
            </button>
          </div>
        </div>

        {/* Tactical Sub-KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#1e293b]">
          <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b] space-y-0.5">
            <div className="text-[10px] font-mono text-[#849396]">PYTHON EXECUTION TIME</div>
            <div className="text-base font-bold font-mono text-[#00e5ff]">{telemetry.sync_duration_ms} ms</div>
          </div>

          <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b] space-y-0.5">
            <div className="text-[10px] font-mono text-[#849396]">SHA-256 CHECKSUM</div>
            <div className="text-xs font-bold font-mono text-[#34d399] truncate">{telemetry.checksum}</div>
          </div>

          <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b] space-y-0.5">
            <div className="text-[10px] font-mono text-[#849396]">OFFLINE PENDING QUEUE</div>
            <div className="text-base font-bold font-mono text-[#fbbf24]">
              {mutationQueue.length} <span className="text-[10px] text-[#849396]">mutations</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b] space-y-0.5">
            <div className="text-[10px] font-mono text-[#849396]">SERVER RECORDS STORED</div>
            <div className="text-base font-bold font-mono text-white">
              {telemetry.total_bookings_on_server} <span className="text-[10px] text-[#849396]">itineraries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation for Sync Console */}
      <div className="flex items-center gap-1.5 border-b border-[#1e293b] pb-2">
        <button
          id="btn-tab-telemetry"
          onClick={() => setActiveTab('telemetry')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
            activeTab === 'telemetry'
              ? 'bg-[#00e5ff] text-[#080c15] font-bold'
              : 'text-[#bac9cc] hover:text-white bg-[#0f172a]'
          }`}
        >
          Vector Clocks & Telemetry
        </button>

        <button
          id="btn-tab-queue"
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors relative ${
            activeTab === 'queue'
              ? 'bg-[#00e5ff] text-[#080c15] font-bold'
              : 'text-[#bac9cc] hover:text-white bg-[#0f172a]'
          }`}
        >
          Offline Mutation Queue ({mutationQueue.length})
        </button>

        <button
          id="btn-tab-conflicts"
          onClick={() => setActiveTab('conflicts')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
            activeTab === 'conflicts'
              ? 'bg-[#00e5ff] text-[#080c15] font-bold'
              : 'text-[#bac9cc] hover:text-white bg-[#0f172a]'
          }`}
        >
          Conflicts Resolved ({telemetry.conflicts_resolved?.length || 0})
        </button>

        <button
          id="btn-tab-code"
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
            activeTab === 'code'
              ? 'bg-[#00e5ff] text-[#080c15] font-bold'
              : 'text-[#bac9cc] hover:text-white bg-[#0f172a]'
          }`}
        >
          Python sync_engine.py Inspector
        </button>
      </div>

      {/* TAB 1: Vector Clocks & Sync Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00e5ff]" />
              Vector Clock State Distribution
            </h3>
            <p className="text-xs text-[#bac9cc]">
              Causal ordering timestamps ensuring mutations across intermittent offline terminals are ordered monotonically.
            </p>

            <div className="p-3 rounded bg-[#080c15] border border-[#1e293b] overflow-x-auto">
              <pre className="font-mono text-xs text-[#00e5ff]">
                {JSON.stringify(telemetry.vector_clock_state, null, 2)}
              </pre>
            </div>

            <div className="text-[11px] font-mono text-[#849396] space-y-1">
              <div>• Last Synced: {new Date(telemetry.last_synced_at).toLocaleTimeString()}</div>
              <div>• Sync Engine Binary: Python 3.10.12 CPython</div>
              <div>• Causal Graph: Monotonic strict-increment</div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34d399]" />
              Data Integrity & Checksum Audit
            </h3>
            <p className="text-xs text-[#bac9cc]">
              SHA-256 cryptographic verification validates that local offline cache exactly matches backend server authoritative state.
            </p>

            <div className="p-3 rounded bg-[#080c15] border border-[#1e293b] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#849396]">
                <span>AUTHORITATIVE CHECKSUM:</span>
                <span className="text-[#34d399] font-bold">{telemetry.checksum}</span>
              </div>
              <div className="flex justify-between text-[#849396]">
                <span>PAYLOAD COMPRESSION:</span>
                <span className="text-white">GZIP / JSON-SCHEMA</span>
              </div>
              <div className="flex justify-between text-[#849396]">
                <span>LATENCY PROFILE:</span>
                <span className="text-[#00e5ff]">{telemetry.sync_duration_ms} ms</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="btn-reset-server-state"
                onClick={onResetServer}
                className="px-3 py-1.5 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#334155] text-xs font-mono text-[#f43f5e] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET REPOSITORY TO DEFAULTS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Offline Mutation Queue */}
      {activeTab === 'queue' && (
        <div className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
                Pending Local Mutation Log ({mutationQueue.length})
              </h3>
              <p className="text-xs text-[#bac9cc]">
                Appended locally when offline. Automatically replayed against Python backend upon reconnection.
              </p>
            </div>
            {mutationQueue.length > 0 && !isOffline && (
              <button
                id="btn-flush-queue-now"
                onClick={onForceSync}
                className="px-3 py-1 rounded bg-[#00e5ff] text-[#080c15] font-mono text-xs font-bold"
              >
                COMMIT PENDING MUTATIONS
              </button>
            )}
          </div>

          {mutationQueue.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-[#849396] space-y-1">
              <CheckCircle2 className="w-8 h-8 text-[#34d399] mx-auto opacity-80" />
              <div className="text-white font-bold">Mutation Queue Clean</div>
              <div>All local transactions are synchronized with the Python server database.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {mutationQueue.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded bg-[#0b1326] border border-[#1e293b] text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#00e5ff] font-bold">{m.action}</span>
                    <span className="text-[#849396]">{new Date(m.client_timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-white">Entity: {m.entity} | Mutation ID: {m.id}</div>
                  <div className="text-[#bac9cc] text-[11px] truncate">
                    Data: {JSON.stringify(m.data)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Conflict Resolution History */}
      {activeTab === 'conflicts' && (
        <div className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-3">
          <div className="border-b border-[#1e293b] pb-3">
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
              Python 3-Way Semantic Conflict Resolutions
            </h3>
            <p className="text-xs text-[#bac9cc]">
              When concurrent bookings contend for the exact same berth or quota, the Python engine applies
              heuristic seat reallocation rather than failing the transaction.
            </p>
          </div>

          {!telemetry.conflicts_resolved || telemetry.conflicts_resolved.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-[#849396] space-y-2">
              <div>No concurrency collisions in current session.</div>
              <button
                id="btn-trigger-test-conflict-inner"
                onClick={onInjectTestConflict}
                className="px-3 py-1.5 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#334155] text-[#fbbf24] font-mono text-xs"
              >
                Inject Concurrency Collision To Test Resolver
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {telemetry.conflicts_resolved.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded bg-[#0b1326] border border-[#f59e0b]/40 text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#fbbf24] font-bold">TYPE: {c.type}</span>
                    <span className="text-[#34d399] font-semibold bg-[#10b981]/15 px-2 py-0.5 rounded">
                      {c.resolution}
                    </span>
                  </div>
                  <div className="text-white font-['Inter'] text-xs">{c.details}</div>
                  <div className="text-[10px] text-[#849396]">Mutation: {c.mutation_id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Python Engine Code Inspector */}
      {activeTab === 'code' && (
        <div className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-sm font-bold font-['Space_Grotesk'] text-white">
                SERVER SYNC ENGINE SOURCE: <code className="text-[#38bdf8] font-mono">sync_engine.py</code>
              </span>
            </div>
            <span className="text-xs font-mono text-[#34d399]">EXECUTED VIA PYTHON 3.10 CHILD_PROCESS</span>
          </div>

          <div className="rounded bg-[#080c15] border border-[#1e293b] p-4 font-mono text-xs text-[#c3f5ff] leading-relaxed max-h-96 overflow-y-auto">
            <pre>{`def resolve_booking_mutation(store: Dict[str, Any], mutation: Dict[str, Any]):
    """
    Applies a booking mutation with 3-way semantic conflict resolution.
    If requested seat / quota is exhausted, auto-allocates closest viable berth
    and logs conflict resolution details.
    """
    conflicts_resolved = []
    m_data = mutation.get("data", {})
    train_id = m_data.get("train_id")
    travel_class = m_data.get("travel_class", "3A")
    
    target_train = next((t for t in store["trains"] if t["id"] == train_id), None)
    class_info = target_train["classes"].get(travel_class)

    # Check for concurrency / quota race
    status = class_info.get("status", "AVAILABLE-01")
    if "AVAILABLE" in status:
        avail_num = class_info.get("available", 1)
        if avail_num > 1:
            class_info["available"] = avail_num - 1
            class_info["status"] = f"AVAILABLE-{class_info['available']:02d}"
        else:
            class_info["available"] = 0
            class_info["waitlist"] = 1
            class_info["status"] = "RAC-01"
    else:
        # 3-Way Semantic Merge: Waitlist re-allocation
        wl_num = class_info.get("waitlist", 0) + 1
        class_info["waitlist"] = wl_num
        class_info["status"] = f"WL-{wl_num:02d}"
        conflicts_resolved.append({
            "mutation_id": mutation.get("id"),
            "type": "QUOTA_RACE_CONDITION",
            "resolution": "CONVERTED_TO_WAITLIST_WITH_PROBABILITY_ESTIMATE",
            "details": f"Direct availability filled by concurrent booking."
        })

    # Commit with Vector Clock update
    store["server_vector_clock"]["server"] += 1
    return new_booking, conflicts_resolved`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
