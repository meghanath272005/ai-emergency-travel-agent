import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Sliders, AlertTriangle } from 'lucide-react';
import type { IRCTCRule } from '../types/transit';

interface IrctcComplianceMatrixProps {
  rules: IRCTCRule[];
  onToggleRule: (ruleId: string) => void;
}

export const IrctcComplianceMatrix: React.FC<IrctcComplianceMatrixProps> = ({
  rules,
  onToggleRule
}) => {
  return (
    <div id="irctc-rules-matrix-view" className="space-y-6">
      {/* Header Banner */}
      <div
        id="rules-matrix-header"
        className="bg-[#0f172a] rounded border border-[#1e293b] p-4 sm:p-5 space-y-2 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00e5ff] uppercase tracking-wider">
                IRCTC REGULATORY AUDIT ENGINE
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                ACTIVE ARMED
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              IRCTC Compliance Rules & Quota Policy Matrix
            </h2>
          </div>
          <div className="text-xs font-mono text-[#849396]">
            5 CORE POLICIES MONITORED IN DISPATCH PIPELINE
          </div>
        </div>
        <p className="text-xs text-[#bac9cc] font-['Inter'] max-w-3xl">
          Enforces regulatory IRCTC sub-second booking limits, Remote Location Waitlist (RLWL) priority orders,
          Tatkal anti-bot locking defense, and dynamic pricing fare ceilings (1.5x Base).
        </p>
      </div>

      {/* Rules Data Table */}
      <div
        id="rules-data-table-container"
        className="bg-[#0b1326] rounded border border-[#1e293b] overflow-hidden shadow-lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Head */}
            <thead className="bg-[#171f33] text-[#bac9cc] font-mono uppercase text-[11px] tracking-wider border-b border-[#334155]/40">
              <tr>
                <th className="p-3.5">RULE IDENTIFIER</th>
                <th className="p-3.5">POLICY CLASS</th>
                <th className="p-3.5">SPECIFICATION & OPERATIONAL SCOPE</th>
                <th className="p-3.5">RISK LEVEL</th>
                <th className="p-3.5">THROTTLE</th>
                <th className="p-3.5 text-right">ENFORCEMENT</th>
              </tr>
            </thead>

            {/* Table Body with alternating rows */}
            <tbody className="divide-y divide-[rgba(51,65,85,0.4)]">
              {rules.map((rule, idx) => {
                const isAlt = idx % 2 === 1;
                const rowBg = isAlt ? 'bg-[#0f172a]' : 'bg-[#0b1120]';

                return (
                  <tr
                    key={rule.id}
                    id={`rule-row-${rule.id}`}
                    className={`${rowBg} hover:bg-[#1e293b]/60 transition-colors`}
                  >
                    {/* Identifier */}
                    <td className="p-3.5 font-mono font-bold text-[#00e5ff] whitespace-nowrap">
                      {rule.id}
                    </td>

                    {/* Policy Class Badge */}
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10px] font-mono font-semibold tracking-wide ${
                          rule.policy_class === 'TATKAL_AUTO_BOOK'
                            ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/40'
                            : rule.policy_class === 'DYNAMIC_FARE_MAX'
                            ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                            : rule.policy_class === 'WAITLIST_RULE'
                            ? 'bg-[#ffc681]/15 text-[#ffc681] border border-[#ffc681]/40'
                            : 'bg-[#1e293b] text-[#bac9cc] border border-[#334155]'
                        }`}
                      >
                        {rule.policy_class}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="p-3.5 space-y-1 max-w-md">
                      <div className="font-semibold text-white font-['Space_Grotesk'] text-sm">
                        {rule.title}
                      </div>
                      <div className="text-[#bac9cc] text-xs font-['Inter'] leading-relaxed">
                        {rule.description}
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          rule.risk_level === 'HIGH'
                            ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30'
                            : rule.risk_level === 'MODERATE'
                            ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30'
                            : 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                        }`}
                      >
                        {rule.risk_level}
                      </span>
                    </td>

                    {/* Throttle Limit */}
                    <td className="p-3.5 font-mono text-xs text-[#bac9cc]">
                      {rule.throttle_limit}
                    </td>

                    {/* Enforcement Toggle */}
                    <td className="p-3.5 text-right">
                      <button
                        id={`btn-toggle-rule-${rule.id}`}
                        onClick={() => onToggleRule(rule.id)}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all inline-flex items-center gap-1.5 ${
                          rule.enforced
                            ? 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/50 hover:bg-[#10b981]/30'
                            : 'bg-[#334155] text-[#849396] hover:text-white border border-[#475569]'
                        }`}
                      >
                        {rule.enforced ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ENFORCED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>BYPASS</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
