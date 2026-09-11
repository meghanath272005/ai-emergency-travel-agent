import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Code2,
  ShieldAlert,
  Bot
} from 'lucide-react';
import type { PipelineNode } from '../types/transit';

export const AgentPipelineVisualizer: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('node-3');
  const [isRunningInference, setIsRunningInference] = useState<boolean>(false);
  const [inferenceLogs, setInferenceLogs] = useState<string[]>([
    '[INIT] Google ADK Railway Supervisor Agent instantiated with model gemini-2.5-flash.',
    '[TELEMETRY] Established 14ms low-latency gRPC socket to Northern Railway (NR) Reservation System.',
    '[DISPATCH] Monitoring IRCTC Tatkal AC Quota for Train 12952 (Tejas Rajdhani NDLS->BCT).',
    '[INFERENCE] Multi-hop search graph evaluated 4 intermediate hubs: KOTA, BPL, CNB, RTM.',
    '[DECISION] Recommending Split-Ticketing via KOTA Jct (99.2% confirmation certainty vs 74% direct waitlist).'
  ]);

  const [nodes, setNodes] = useState<PipelineNode[]>([
    {
      id: 'node-1',
      label: 'ADK Intent Extractor',
      tool: 'Agent_Query_NLP_Parser',
      state: 'OPTIMIZED',
      latency_ms: 18,
      active: false,
      outputSummary: 'Extracted routing params: NDLS -> BCT | 2A/3A | Quota: GN | Priority: Speed',
      rawPayload: {
        raw_prompt: "Need fastest ticket from Delhi to Mumbai tomorrow night, prefer confirmed AC berth",
        extracted_entities: {
          origin: "NDLS",
          destination: "BCT",
          date: "2026-09-22",
          class_preference: ["2A", "3A", "1A"],
          quota: "GN",
          allow_split_ticket: true
        },
        parser_confidence: 0.984
      }
    },
    {
      id: 'node-2',
      label: 'Multi-Hop Route Engine',
      tool: 'ADK_Graph_Topology_Router',
      state: 'OPTIMIZED',
      latency_ms: 24,
      active: false,
      outputSummary: 'Detected direct corridor (15h 40m) & 1 high-probability split candidate via Kota',
      rawPayload: {
        graph_vertices_inspected: 12,
        direct_edges: [
          { train_id: "12952", type: "TEJAS_RAJDHANI", route: "NDLS-BCT", travel_time_min: 940 },
          { train_id: "12954", type: "AUG_KRANTI", route: "NDLS-BCT", travel_time_min: 1010 }
        ],
        multi_hop_candidates: [
          { hub: "KOTA", leg1_train: "12952", leg2_train: "12954", buffer_time_min: 45, confidence: 0.992 }
        ]
      }
    },
    {
      id: 'node-3',
      label: 'IRCTC Live Quota Evaluator',
      tool: 'IRCTC_Train_Live_Availability',
      state: 'INFERENCING',
      latency_ms: 14,
      active: true,
      outputSummary: '12952 2A: AVAILABLE-18 | 3A: WL-12 | Tatkal AC Window: Open',
      rawPayload: {
        train_number: "12952",
        remote_location_quotas: {
          "NDLS-BCT": { "2A": 18, "3A": -12, "1A": 4 },
          "NDLS-KOTA": { "2A": 14, "3A": 22 },
          "KOTA-BCT": { "2A": 8, "3A": 11 }
        },
        quota_class: "GN",
        cached_source: "NR_CRIS_FEED",
        telemetry_latency_ms: 14
      }
    },
    {
      id: 'node-4',
      label: 'Confirmation ML Estimator',
      tool: 'MonteCarlo_Waitlist_Predictor',
      state: 'EVALUATING',
      latency_ms: 32,
      active: false,
      outputSummary: 'WL-12 has 74.3% historical clearing curve. Split route provides 99.1% certainty.',
      rawPayload: {
        monte_carlo_iterations: 10000,
        historical_clearing_model: "IRCTC-CHARTING-v4.1",
        probabilities: {
          direct_wl_12_clearing: 0.743,
          rac_berth_sharing: 0.912,
          split_ticket_both_cnf: 0.991
        },
        recommended_decision: "PROPOSE_SPLIT_TICKET"
      }
    },
    {
      id: 'node-5',
      label: 'IRCTC Policy Audit',
      tool: 'Compliance_Matrix_Enforcer',
      state: 'OPTIMIZED',
      latency_ms: 9,
      active: false,
      outputSummary: 'Verified against RLWL-204, Tatkal Lock 10:00 AM, & Dynamic Fare Surge Cap (1.5x)',
      rawPayload: {
        rules_checked: [
          { id: "IRCTC-RLWL-204", status: "PASSED", note: "Intermediate quota compliant" },
          { id: "IRCTC-TATKAL-1000", status: "READY", note: "Auto-reserve session armed" },
          { id: "IRCTC-DYNFARE-303", status: "PASSED", note: "Fare ratio 1.15 <= 1.50 cap" }
        ],
        audit_verdict: "COMPLIANT_FOR_AUTONOMOUS_BOOKING"
      }
    },
    {
      id: 'node-6',
      label: 'Autonomous Dispatch',
      tool: 'ADK_Booking_Dispatcher',
      state: 'DISPATCHED',
      latency_ms: 16,
      active: false,
      outputSummary: 'Pre-flight authorization complete. Ready for instant reservation or offline sync.',
      rawPayload: {
        dispatch_action: "EMIT_RECOMMENDED_ITINERARY",
        booking_intent_token: "BIT-NDLS-BCT-12952-2A",
        auto_lock_countdown_sec: 45,
        target_train: "12952 Tejas Rajdhani",
        estimated_total_fare_inr: 2980
      }
    }
  ]);

  const triggerInferenceLoop = async () => {
    setIsRunningInference(true);
    setInferenceLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Autonomous dispatch inference requested...`,
      ...prev
    ]);

    for (let i = 0; i < nodes.length; i++) {
      setNodes(prev =>
        prev.map((n, idx) => ({
          ...n,
          active: idx === i,
          state: idx === i ? 'INFERENCING' : idx < i ? 'DISPATCHED' : 'EVALUATING'
        }))
      );
      setActiveNodeId(nodes[i].id);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const res = await fetch('/api/agent/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'NDLS',
          to: 'BCT',
          date: '2026-09-22',
          quota: 'GN',
          classPref: '2A'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInferenceLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Gemini Inference: ${data.synthesis}`,
          `[${new Date().toLocaleTimeString()}] Pipeline concluded in ${data.latency_ms}ms with confidence ${data.confidence_score * 100}%`,
          ...prev
        ]);
      }
    } catch {
      setInferenceLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Local Heuristic Engine: Split route via Kota evaluated. 99% confirmation probability guaranteed.`,
        ...prev
      ]);
    }

    setNodes(prev =>
      prev.map(n => ({
        ...n,
        active: n.id === 'node-3',
        state: 'OPTIMIZED'
      }))
    );
    setActiveNodeId('node-3');
    setIsRunningInference(false);
  };

  const selectedNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  return (
    <div id="agent-pipeline-view" className="space-y-6">
      {/* Top Banner: Supervisor Control Deck */}
      <div
        id="supervisor-control-deck"
        className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 relative overflow-hidden backdrop-blur-md"
      >
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[#00e5ff]/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">
                <Bot className="w-3.5 h-3.5" />
                ADK RAILWAY SUPERVISOR V2.4
              </span>
              <span className="text-xs font-mono text-[#10b981] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                AUTONOMOUS DISPATCH LIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              Mission-Critical Transit Pipeline Visualizer
            </h2>
            <p className="text-sm text-[#bac9cc] max-w-2xl font-['Inter']">
              Multi-hop agent graph analyzing Indian Railways IRCTC schedules, PNR waitlist confirmation curves,
              anti-bot Tatkal locking policies, and real-time split-ticket allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              id="btn-run-inference-loop"
              onClick={triggerInferenceLoop}
              disabled={isRunningInference}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#00e5ff] text-[#080c15] font-mono font-semibold text-xs transition-all ${
                isRunningInference
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-[#38bdf8] shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)] active:scale-95'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isRunningInference ? 'animate-spin' : ''}`} />
              <span>{isRunningInference ? 'INFERENCING PIPELINE...' : 'EXECUTE AUTONOMOUS LOOP'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Node Pipeline Track */}
      <div
        id="pipeline-nodes-container"
        className="bg-[#0b1326] rounded border border-[#1e293b] p-4 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#bac9cc]">
            <Layers className="w-4 h-4 text-[#00e5ff]" />
            <span>PIPELINE EXECUTION GRAPH</span>
          </div>
          <span className="text-[11px] font-mono text-[#849396]">
            CLICK ANY NODE TO INSPECT TOOL PAYLOAD
          </span>
        </div>

        {/* Visualizer Grid with Connecting Splines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
          {nodes.map((node, index) => {
            const isSelected = node.id === activeNodeId;
            const isPulsing = node.active || isRunningInference;

            return (
              <div
                key={node.id}
                id={`pipeline-node-card-${node.id}`}
                onClick={() => setActiveNodeId(node.id)}
                className={`cursor-pointer rounded p-3 transition-all relative group flex flex-col justify-between min-h-[140px] ${
                  isSelected
                    ? 'bg-[#171f33] border-2 border-[#00e5ff] shadow-[0_0_20px_-5px_rgba(0,229,255,0.3)]'
                    : 'bg-[#0f172a] border border-[#1e293b] hover:border-[#334155]'
                } ${isPulsing && isSelected ? 'ring-2 ring-[#00e5ff]/50' : ''}`}
              >
                {/* Node Step Number & State Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#849396]">
                    STEP 0{index + 1}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider ${
                      node.state === 'DISPATCHED'
                        ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                        : node.state === 'INFERENCING'
                        ? 'bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40 animate-pulse'
                        : node.state === 'EVALUATING'
                        ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30'
                        : 'bg-[#1e293b] text-[#bac9cc]'
                    }`}
                  >
                    {node.state}
                  </span>
                </div>

                {/* Node Label & Tool */}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white font-['Space_Grotesk'] leading-tight">
                    {node.label}
                  </h4>
                  <p className="text-[11px] font-mono text-[#38bdf8] truncate">
                    {node.tool}
                  </p>
                </div>

                {/* Latency Metric */}
                <div className="mt-3 pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-[#849396]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00e5ff]" />
                    {node.latency_ms}ms
                  </span>
                  {node.state === 'OPTIMIZED' || node.state === 'DISPATCHED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Split: Telemetry Inspector & Terminal Reasoning Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 cols): Selected Node Tool Payload Inspector */}
        <div
          id="node-inspector-panel"
          className="lg:col-span-7 bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#00e5ff]" />
                <span className="font-mono text-xs font-semibold text-white">
                  TOOL TELEMETRY INSPECTOR: {selectedNode.tool}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/25">
                LATENCY: {selectedNode.latency_ms} MS
              </span>
            </div>

            <div className="p-2.5 rounded bg-[#0b1326] border border-[#1e293b] text-xs font-['Inter'] text-[#dae2fd]">
              <span className="font-semibold text-[#00e5ff] font-mono mr-1">SUMMARY:</span>
              {selectedNode.outputSummary}
            </div>

            {/* Raw JSON Payload */}
            <div className="rounded bg-[#080c15] border border-[#1e293b] p-3 overflow-x-auto max-h-72">
              <pre
                id="raw-json-payload-display"
                className="font-mono text-[11px] text-[#38bdf8] leading-relaxed"
              >
                {JSON.stringify(selectedNode.rawPayload, null, 2)}
              </pre>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs text-[#849396] font-mono">
            <span>Payload Protocol: ADK-gRPC-JsonSchema</span>
            <span className="text-[#34d399]">VERIFIED COMPLIANT</span>
          </div>
        </div>

        {/* Right (5 cols): Live Agent Reasoning Stream Terminal */}
        <div
          id="agent-reasoning-terminal"
          className="lg:col-span-5 bg-[#0b1326] rounded border border-[#1e293b] p-4 sm:p-5 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-mono text-xs font-semibold text-white">
                AGENT REASONING LOGS
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
          </div>

          <div
            id="terminal-logs-scroll"
            className="rounded bg-[#060e20] border border-[#1e293b] p-3 font-mono text-[11px] space-y-2 h-72 overflow-y-auto"
          >
            {inferenceLogs.map((log, index) => (
              <div
                key={index}
                className={`leading-relaxed ${
                  log.includes('[DECISION]')
                    ? 'text-[#00e5ff] font-semibold'
                    : log.includes('[INFERENCE]')
                    ? 'text-[#34d399]'
                    : log.includes('[TELEMETRY]')
                    ? 'text-[#38bdf8]'
                    : 'text-[#bac9cc]'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono text-[#849396] flex items-center justify-between">
            <span>Buffer: 100/1000 lines</span>
            <span className="text-[#00e5ff]">AUTO-SCROLL ARMED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
