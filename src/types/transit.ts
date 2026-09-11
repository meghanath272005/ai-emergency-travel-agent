export interface Station {
  code: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  platforms: number;
}

export interface ClassAvailability {
  available: number;
  waitlist: number;
  fare: number;
  status: string;
  conf_prob: number;
}

export interface Train {
  id: string;
  name: string;
  type: string;
  from_code: string;
  to_code: string;
  departure: string;
  arrival: string;
  duration: string;
  speed_kmh: number;
  punctuality_pct: number;
  classes: Record<string, ClassAvailability>;
  route_stops: string[];
  tatkal_open: boolean;
  dynamic_pricing_factor: number;
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berth: string;
  status: string;
  quota: string;
}

export interface Booking {
  pnr: string;
  train_id: string;
  train_name: string;
  from_code: string;
  to_code: string;
  date: string;
  travel_class: string;
  passengers: Passenger[];
  current_status: string;
  booking_status: string;
  chart_prepared: boolean;
  conf_prob: number;
  fare: number;
  timestamp: number;
  vector_clock: Record<string, number>;
  offline_pending?: boolean;
}

export interface IRCTCRule {
  id: string;
  policy_class: string;
  title: string;
  description: string;
  enforced: boolean;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'INFO';
  throttle_limit: string;
}

export interface AgentDispatchLog {
  id: string;
  agent: string;
  intent: string;
  decision: string;
  confidence: number;
  latency_ms: number;
  timestamp: number;
}

export interface MutationRecord {
  id: string;
  action: 'CREATE_BOOKING' | 'CANCEL_BOOKING' | 'DISPATCH_OVERRIDE' | 'TOGGLE_RULE_POLICY';
  entity: 'booking' | 'rule' | 'dispatch';
  data: any;
  client_timestamp: number;
  vector_clock: Record<string, number>;
}

export interface ConflictRecord {
  mutation_id: string;
  type: string;
  resolution: string;
  details: string;
}

export interface SyncTelemetry {
  sync_duration_ms: number;
  engine: string;
  checksum: string;
  total_bookings_on_server: number;
  vector_clock_state: Record<string, number>;
  last_synced_at: number;
  pending_count: number;
  conflicts_detected: number;
  conflicts_resolved: ConflictRecord[];
}

export interface PipelineNode {
  id: string;
  label: string;
  tool: string;
  state: 'IDLE' | 'INFERENCING' | 'EVALUATING' | 'OPTIMIZED' | 'DISPATCHED';
  latency_ms: number;
  active: boolean;
  outputSummary: string;
  rawPayload: Record<string, any>;
}
