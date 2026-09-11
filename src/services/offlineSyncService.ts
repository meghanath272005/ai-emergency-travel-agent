import type {
  Station,
  Train,
  Booking,
  IRCTCRule,
  AgentDispatchLog,
  MutationRecord,
  SyncTelemetry,
  ConflictRecord
} from '../types/transit';

const STORAGE_KEYS = {
  QUEUE: 'neural_transit_offline_queue',
  STATIONS: 'neural_transit_stations',
  TRAINS: 'neural_transit_trains',
  BOOKINGS: 'neural_transit_bookings',
  RULES: 'neural_transit_rules',
  DISPATCH: 'neural_transit_dispatch',
  TELEMETRY: 'neural_transit_telemetry',
  VECTOR_CLOCK: 'neural_transit_vector_clock',
  SIMULATED_OFFLINE: 'neural_transit_simulated_offline',
  OFFLINE_PACK: 'neural_transit_offline_pack'
};

const DEFAULT_STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi Central', zone: 'NR', lat: 28.6427, lon: 77.2195, platforms: 16 },
  { code: 'BCT', name: 'Mumbai Central', zone: 'WR', lat: 18.9696, lon: 72.8193, platforms: 9 },
  { code: 'SBC', name: 'KSR Bengaluru City', zone: 'SWR', lat: 12.9784, lon: 77.5695, platforms: 10 },
  { code: 'HWH', name: 'Howrah Junction Kolkata', zone: 'ER', lat: 22.5839, lon: 88.3426, platforms: 23 },
  { code: 'MAS', name: 'Chennai Central', zone: 'SR', lat: 13.0827, lon: 80.2755, platforms: 12 },
  { code: 'KOTA', name: 'Kota Junction', zone: 'WCR', lat: 25.2138, lon: 75.8648, platforms: 6 },
  { code: 'BPL', name: 'Bhopal Junction', zone: 'WCR', lat: 23.2599, lon: 77.4126, platforms: 6 },
  { code: 'CNB', name: 'Kanpur Central', zone: 'NCR', lat: 26.4547, lon: 80.3507, platforms: 10 },
  { code: 'BSB', name: 'Varanasi Junction', zone: 'NER', lat: 25.3283, lon: 82.9866, platforms: 9 }
];

const DEFAULT_TRAINS: Train[] = [
  {
    id: '12952',
    name: 'Mumbai Tejas Rajdhani',
    type: 'Superfast Premium',
    from_code: 'NDLS',
    to_code: 'BCT',
    departure: '16:55',
    arrival: '08:35',
    duration: '15h 40m',
    speed_kmh: 130,
    punctuality_pct: 98.4,
    classes: {
      '1A': { available: 4, waitlist: 0, fare: 4650, status: 'AVAILABLE-04', conf_prob: 100 },
      '2A': { available: 18, waitlist: 0, fare: 2980, status: 'AVAILABLE-18', conf_prob: 100 },
      '3A': { available: 0, waitlist: 12, fare: 2180, status: 'WL-12', conf_prob: 74 }
    },
    route_stops: ['NDLS', 'KOTA', 'RTM', 'BRC', 'ST', 'BVI', 'BCT'],
    tatkal_open: true,
    dynamic_pricing_factor: 1.15
  },
  {
    id: '22436',
    name: 'Vande Bharat Express',
    type: 'Semi-High Speed',
    from_code: 'NDLS',
    to_code: 'BSB',
    departure: '06:00',
    arrival: '14:00',
    duration: '8h 00m',
    speed_kmh: 160,
    punctuality_pct: 99.1,
    classes: {
      'EC': { available: 8, waitlist: 0, fare: 3350, status: 'AVAILABLE-08', conf_prob: 100 },
      'CC': { available: 34, waitlist: 0, fare: 1750, status: 'AVAILABLE-34', conf_prob: 100 }
    },
    route_stops: ['NDLS', 'CNB', 'PRYJ', 'BSB'],
    tatkal_open: true,
    dynamic_pricing_factor: 1.00
  },
  {
    id: '12302',
    name: 'Howrah Rajdhani Express',
    type: 'Superfast Premium',
    from_code: 'NDLS',
    to_code: 'HWH',
    departure: '16:50',
    arrival: '09:55',
    duration: '17h 05m',
    speed_kmh: 130,
    punctuality_pct: 96.8,
    classes: {
      '1A': { available: 2, waitlist: 0, fare: 4820, status: 'AVAILABLE-02', conf_prob: 100 },
      '2A': { available: 0, waitlist: 8, fare: 3050, status: 'WL-08', conf_prob: 82 },
      '3A': { available: 0, waitlist: 24, fare: 2240, status: 'WL-24', conf_prob: 58 }
    },
    route_stops: ['NDLS', 'CNB', 'DDU', 'GAYA', 'DHN', 'HWH'],
    tatkal_open: true,
    dynamic_pricing_factor: 1.20
  },
  {
    id: '12626',
    name: 'Kerala Superfast Express',
    type: 'Long Distance Superfast',
    from_code: 'NDLS',
    to_code: 'MAS',
    departure: '20:10',
    arrival: '04:45',
    duration: '32h 35m',
    speed_kmh: 110,
    punctuality_pct: 94.2,
    classes: {
      '2A': { available: 6, waitlist: 0, fare: 3120, status: 'AVAILABLE-06', conf_prob: 100 },
      '3A': { available: 22, waitlist: 0, fare: 2180, status: 'AVAILABLE-22', conf_prob: 100 },
      'SL': { available: 0, waitlist: 45, fare: 820, status: 'WL-45', conf_prob: 42 }
    },
    route_stops: ['NDLS', 'AGC', 'GWL', 'BPL', 'NGP', 'BZA', 'MAS'],
    tatkal_open: false,
    dynamic_pricing_factor: 1.05
  },
  {
    id: '12954',
    name: 'August Kranti Tejas Rajdhani',
    type: 'Superfast Premium',
    from_code: 'NDLS',
    to_code: 'BCT',
    departure: '17:15',
    arrival: '10:05',
    duration: '16h 50m',
    speed_kmh: 125,
    punctuality_pct: 97.2,
    classes: {
      '1A': { available: 1, waitlist: 0, fare: 4650, status: 'AVAILABLE-01', conf_prob: 100 },
      '2A': { available: 12, waitlist: 0, fare: 2980, status: 'AVAILABLE-12', conf_prob: 100 },
      '3A': { available: 5, waitlist: 0, fare: 2180, status: 'AVAILABLE-05', conf_prob: 98 }
    },
    route_stops: ['NDLS', 'MTJ', 'KOTA', 'RTM', 'ST', 'BCT'],
    tatkal_open: true,
    dynamic_pricing_factor: 1.10
  }
];

const DEFAULT_RULES: IRCTCRule[] = [
  {
    id: 'IRCTC-RLWL-204',
    policy_class: 'WAITLIST_RULE',
    title: 'Remote Location Waitlist (RLWL) Priority Protocol',
    description: 'RLWL tickets are prioritized behind General Waitlist (GNWL) during charting. Intermediate boarding quotas strictly enforced.',
    enforced: true,
    risk_level: 'MODERATE',
    throttle_limit: '50 req/min'
  },
  {
    id: 'IRCTC-TATKAL-1000',
    policy_class: 'TATKAL_AUTO_BOOK',
    title: 'Tatkal 10:00 AM AC Quota Locking Window',
    description: 'Automated sub-second lock enabled at 10:00:00 AM IST for AC classes. Anti-bot OTP bypass defense active.',
    enforced: true,
    risk_level: 'HIGH',
    throttle_limit: '20 req/min'
  },
  {
    id: 'IRCTC-DYNFARE-303',
    policy_class: 'DYNAMIC_FARE_MAX',
    title: 'Dynamic Fare Surge Cap (1.5x Base)',
    description: 'SuFast and Rajdhani premium surcharge capped at 150% of base fare. Quota slabs of 10% determine increment.',
    enforced: true,
    risk_level: 'LOW',
    throttle_limit: 'UNLIMITED'
  },
  {
    id: 'IRCTC-RAC-109',
    policy_class: 'RAC_REGULATION',
    title: 'Reservation Against Cancellation Berth Sharing',
    description: 'RAC passengers share Side Lower berths. 100% chart preparation guarantee for RAC <= 12.',
    enforced: true,
    risk_level: 'LOW',
    throttle_limit: 'UNLIMITED'
  },
  {
    id: 'IRCTC-CANC-501',
    policy_class: 'REFUND_MATRIX',
    title: 'TDR & Auto-Cancellation Refund SLA',
    description: 'Waitlisted e-tickets auto-cancel after chart prep with 100% refund credited within 3-5 bank clearing cycles.',
    enforced: true,
    risk_level: 'INFO',
    throttle_limit: 'UNLIMITED'
  }
];

class OfflineSyncService {
  private clientId = 'client-terminal-' + Math.random().toString(36).substring(2, 7);
  private listeners: Array<() => void> = [];
  private isSimulatedOffline = false;
  private isSyncing = false;
  private lastSyncTimestamp = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedSim = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE);
      this.isSimulatedOffline = storedSim === 'true';

      // Auto listen to window online/offline events
      window.addEventListener('online', () => {
        this.notify();
        if (!this.isSimulatedOffline) {
          this.syncWithPythonBackend();
        }
      });
      window.addEventListener('offline', () => {
        this.notify();
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  public isEffectivelyOffline(): boolean {
    if (typeof navigator === 'undefined') return false;
    return this.isSimulatedOffline || !navigator.onLine;
  }

  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, String(this.isSimulatedOffline));
    }
    this.notify();
    if (!this.isEffectivelyOffline()) {
      this.syncWithPythonBackend();
    }
    return this.isSimulatedOffline;
  }

  public getSimulatedOfflineState(): boolean {
    return this.isSimulatedOffline;
  }

  public getClientId(): string {
    return this.clientId;
  }

  // --- LOCAL PERSISTENCE ---

  public getStations(): Station[] {
    if (typeof window === 'undefined') return DEFAULT_STATIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.STATIONS);
    if (!stored) {
      this.saveStations(DEFAULT_STATIONS);
      return DEFAULT_STATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_STATIONS;
    }
  }

  public saveStations(stations: Station[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(stations));
    }
  }

  public getTrains(): Train[] {
    if (typeof window === 'undefined') return DEFAULT_TRAINS;
    const stored = localStorage.getItem(STORAGE_KEYS.TRAINS);
    if (!stored) {
      this.saveTrains(DEFAULT_TRAINS);
      return DEFAULT_TRAINS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_TRAINS;
    }
  }

  public saveTrains(trains: Train[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
    }
  }

  public getBookings(): Booking[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public saveBookings(bookings: Booking[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }
  }

  public getRules(): IRCTCRule[] {
    if (typeof window === 'undefined') return DEFAULT_RULES;
    const stored = localStorage.getItem(STORAGE_KEYS.RULES);
    if (!stored) {
      this.saveRules(DEFAULT_RULES);
      return DEFAULT_RULES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_RULES;
    }
  }

  public saveRules(rules: IRCTCRule[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    }
  }

  public getDispatchLogs(): AgentDispatchLog[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.DISPATCH);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public saveDispatchLogs(logs: AgentDispatchLog[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DISPATCH, JSON.stringify(logs));
    }
  }

  public getMutationQueue(): MutationRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.QUEUE);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private saveMutationQueue(queue: MutationRecord[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
    }
  }

  public getVectorClock(): Record<string, number> {
    if (typeof window === 'undefined') return { client: 1 };
    const stored = localStorage.getItem(STORAGE_KEYS.VECTOR_CLOCK);
    if (!stored) return { [this.clientId]: 1 };
    try {
      return JSON.parse(stored);
    } catch {
      return { [this.clientId]: 1 };
    }
  }

  private saveVectorClock(clock: Record<string, number>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VECTOR_CLOCK, JSON.stringify(clock));
    }
  }

  public getTelemetry(): SyncTelemetry {
    const defaultTelemetry: SyncTelemetry = {
      sync_duration_ms: 1.2,
      engine: 'Python-3.10-SyncEngine',
      checksum: 'e701546fa2fe98fd',
      total_bookings_on_server: this.getBookings().length,
      vector_clock_state: this.getVectorClock(),
      last_synced_at: this.lastSyncTimestamp || Date.now(),
      pending_count: this.getMutationQueue().length,
      conflicts_detected: 0,
      conflicts_resolved: []
    };

    if (typeof window === 'undefined') return defaultTelemetry;
    const stored = localStorage.getItem(STORAGE_KEYS.TELEMETRY);
    if (!stored) return defaultTelemetry;
    try {
      const parsed = JSON.parse(stored);
      parsed.pending_count = this.getMutationQueue().length;
      return parsed;
    } catch {
      return defaultTelemetry;
    }
  }

  private saveTelemetry(t: SyncTelemetry): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(t));
    }
  }

  // --- MUTATION ACTIONS (OFFLINE-FIRST) ---

  public createBooking(bookingData: {
    train_id: string;
    travel_class: string;
    passenger_name: string;
    age: number;
    gender: 'M' | 'F' | 'O';
    preferred_berth: string;
    date: string;
    from_code: string;
    to_code: string;
  }): Booking {
    const pnr = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const trains = this.getTrains();
    const train = trains.find(t => t.id === bookingData.train_id) || trains[0];
    const classInfo = train.classes[bookingData.travel_class] || Object.values(train.classes)[0];

    const isAvailable = (classInfo?.available || 0) > 0;
    const assignedStatus = isAvailable ? `CNF / ${bookingData.preferred_berth}` : `WL-${(classInfo?.waitlist || 0) + 1} (RLWL)`;
    const confProb = isAvailable ? 100 : Math.max(30, (classInfo?.conf_prob || 75) - 5);

    // Optimistic booking
    const newBooking: Booking = {
      pnr,
      train_id: train.id,
      train_name: train.name,
      from_code: bookingData.from_code || train.from_code,
      to_code: bookingData.to_code || train.to_code,
      date: bookingData.date,
      travel_class: bookingData.travel_class,
      passengers: [
        {
          name: bookingData.passenger_name,
          age: bookingData.age,
          gender: bookingData.gender,
          berth: bookingData.preferred_berth,
          status: assignedStatus,
          quota: 'GN'
        }
      ],
      current_status: assignedStatus,
      booking_status: assignedStatus,
      chart_prepared: false,
      conf_prob: confProb,
      fare: classInfo?.fare || 2400,
      timestamp: Date.now(),
      vector_clock: { [this.clientId]: (this.getVectorClock()[this.clientId] || 0) + 1 },
      offline_pending: this.isEffectivelyOffline()
    };

    // Update local seat count optimistically
    if (classInfo) {
      if (classInfo.available > 0) {
        classInfo.available -= 1;
        classInfo.status = `AVAILABLE-${String(classInfo.available).padStart(2, '0')}`;
      } else {
        classInfo.waitlist += 1;
        classInfo.status = `WL-${String(classInfo.waitlist).padStart(2, '0')}`;
      }
      this.saveTrains(trains);
    }

    // Save local booking
    const currentBookings = this.getBookings();
    currentBookings.unshift(newBooking);
    this.saveBookings(currentBookings);

    // Enqueue mutation
    const queue = this.getMutationQueue();
    const mutation: MutationRecord = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action: 'CREATE_BOOKING',
      entity: 'booking',
      data: {
        ...bookingData,
        pnr
      },
      client_timestamp: Date.now(),
      vector_clock: newBooking.vector_clock
    };
    queue.push(mutation);
    this.saveMutationQueue(queue);

    // Increment client vector clock
    const clock = this.getVectorClock();
    clock[this.clientId] = (clock[this.clientId] || 0) + 1;
    this.saveVectorClock(clock);

    this.notify();

    // Trigger background sync if online
    if (!this.isEffectivelyOffline()) {
      this.syncWithPythonBackend();
    }

    return newBooking;
  }

  public cancelBooking(pnr: string): void {
    const bookings = this.getBookings();
    const target = bookings.find(b => b.pnr === pnr);
    if (target) {
      target.current_status = 'CANCELLED (TDR FILED)';
      target.conf_prob = 0;
      target.offline_pending = this.isEffectivelyOffline();
      this.saveBookings(bookings);

      const queue = this.getMutationQueue();
      queue.push({
        id: `mut_cancel_${Date.now()}`,
        action: 'CANCEL_BOOKING',
        entity: 'booking',
        data: { pnr },
        client_timestamp: Date.now(),
        vector_clock: { [this.clientId]: (this.getVectorClock()[this.clientId] || 0) + 1 }
      });
      this.saveMutationQueue(queue);
      this.notify();

      if (!this.isEffectivelyOffline()) {
        this.syncWithPythonBackend();
      }
    }
  }

  public toggleRulePolicy(ruleId: string): void {
    const rules = this.getRules();
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enforced = !rule.enforced;
      this.saveRules(rules);

      const queue = this.getMutationQueue();
      queue.push({
        id: `mut_rule_${Date.now()}`,
        action: 'TOGGLE_RULE_POLICY',
        entity: 'rule',
        data: { rule_id: ruleId },
        client_timestamp: Date.now(),
        vector_clock: { [this.clientId]: (this.getVectorClock()[this.clientId] || 0) + 1 }
      });
      this.saveMutationQueue(queue);
      this.notify();

      if (!this.isEffectivelyOffline()) {
        this.syncWithPythonBackend();
      }
    }
  }

  public overrideDispatch(intent: string, decision: string): void {
    const logs = this.getDispatchLogs();
    const newLog: AgentDispatchLog = {
      id: `DSP-${Date.now().toString().slice(-5)}`,
      agent: 'ADK-Officer-Override',
      intent,
      decision,
      confidence: 1.0,
      latency_ms: 12,
      timestamp: Date.now()
    };
    logs.unshift(newLog);
    this.saveDispatchLogs(logs);

    const queue = this.getMutationQueue();
    queue.push({
      id: `mut_dsp_${Date.now()}`,
      action: 'DISPATCH_OVERRIDE',
      entity: 'dispatch',
      data: { intent, decision, agent: 'ADK-Officer-Override' },
      client_timestamp: Date.now(),
      vector_clock: { [this.clientId]: (this.getVectorClock()[this.clientId] || 0) + 1 }
    });
    this.saveMutationQueue(queue);
    this.notify();

    if (!this.isEffectivelyOffline()) {
      this.syncWithPythonBackend();
    }
  }

  // --- PYTHON SEAMLESS BACKEND SYNCHRONIZATION ---

  public async syncWithPythonBackend(): Promise<{ success: boolean; message: string; conflicts?: ConflictRecord[] }> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }
    if (this.isEffectivelyOffline()) {
      return { success: false, message: 'Terminal is currently in offline mode' };
    }

    this.isSyncing = true;
    this.notify();

    try {
      const queue = this.getMutationQueue();
      const payload = {
        client_id: this.clientId,
        last_sync_timestamp: this.lastSyncTimestamp,
        mutations: queue,
        client_vector_clock: this.getVectorClock()
      };

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Sync API responded with status ${response.status}`);
      }

      const syncResult = await response.json();

      // Clear synced mutations
      this.saveMutationQueue([]);

      // Merge server deltas
      if (syncResult.server_deltas) {
        if (syncResult.server_deltas.trains) {
          this.saveTrains(syncResult.server_deltas.trains);
        }
        if (syncResult.server_deltas.stations) {
          this.saveStations(syncResult.server_deltas.stations);
        }
        if (syncResult.server_deltas.irctc_rules) {
          this.saveRules(syncResult.server_deltas.irctc_rules);
        }
        if (syncResult.server_deltas.agent_dispatch_logs) {
          this.saveDispatchLogs(syncResult.server_deltas.agent_dispatch_logs);
        }
        if (syncResult.server_deltas.bookings) {
          // Merge bookings, keeping local pending markers cleared
          const serverBookings: Booking[] = syncResult.server_deltas.bookings.map((b: Booking) => ({
            ...b,
            offline_pending: false
          }));
          this.saveBookings(serverBookings);
        }
      }

      // Update vector clock & timestamps
      if (syncResult.server_vector_clock) {
        this.saveVectorClock(syncResult.server_vector_clock);
      }
      this.lastSyncTimestamp = syncResult.synced_at || Date.now();

      // Update telemetry
      const telemetry: SyncTelemetry = {
        sync_duration_ms: syncResult.telemetry?.sync_duration_ms || 1.4,
        engine: syncResult.telemetry?.engine || 'Python-3.10-SyncEngine',
        checksum: syncResult.telemetry?.checksum || 'a4f89c02',
        total_bookings_on_server: syncResult.telemetry?.total_bookings_on_server || this.getBookings().length,
        vector_clock_state: syncResult.server_vector_clock || {},
        last_synced_at: this.lastSyncTimestamp,
        pending_count: 0,
        conflicts_detected: syncResult.conflicts_detected || 0,
        conflicts_resolved: syncResult.conflicts_resolved || []
      };
      this.saveTelemetry(telemetry);

      return {
        success: true,
        message: `Synced ${syncResult.applied_mutations || queue.length} mutations with Python sync engine in ${telemetry.sync_duration_ms}ms`,
        conflicts: syncResult.conflicts_resolved
      };
    } catch (err: any) {
      console.warn('Sync failed (offline or server error):', err.message);
      return { success: false, message: `Sync failed: ${err.message}` };
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  public async fetchOfflinePack(): Promise<boolean> {
    try {
      const res = await fetch('/api/offline-pack');
      if (!res.ok) return false;
      const pack = await res.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.OFFLINE_PACK, JSON.stringify(pack));
      }
      if (pack.stations) this.saveStations(pack.stations);
      if (pack.trains) this.saveTrains(pack.trains);
      if (pack.irctc_rules) this.saveRules(pack.irctc_rules);
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public async resetServerAndLocal(): Promise<boolean> {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {}
    this.saveMutationQueue([]);
    this.saveStations(DEFAULT_STATIONS);
    this.saveTrains(DEFAULT_TRAINS);
    this.saveRules(DEFAULT_RULES);
    this.saveBookings([]);
    this.saveDispatchLogs([]);
    this.saveVectorClock({ [this.clientId]: 1 });
    await this.syncWithPythonBackend();
    this.notify();
    return true;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new OfflineSyncService();
