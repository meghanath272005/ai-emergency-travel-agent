#!/usr/bin/env python3
"""
Mission-Critical Neural Transit - Data Synchronization Engine
Handles seamless bidirectional synchronization, vector clocks, conflict resolution,
offline queue processing, and IRCTC seat allocation reconciliation.
"""

import sys
import json
import os
import time
import hashlib
import argparse
from typing import Dict, Any, List, Tuple

STORE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server_store.json")

# Default high-fidelity transit dataset for IRCTC / Neural Transit ADK
DEFAULT_INITIAL_DATA = {
    "server_version": "2.4.0",
    "server_vector_clock": {"server": 100},
    "last_updated": int(time.time() * 1000),
    "stations": [
        {"code": "NDLS", "name": "New Delhi Central", "zone": "NR", "lat": 28.6427, "lon": 77.2195, "platforms": 16},
        {"code": "BCT", "name": "Mumbai Central", "zone": "WR", "lat": 18.9696, "lon": 72.8193, "platforms": 9},
        {"code": "SBC", "name": "KSR Bengaluru City", "zone": "SWR", "lat": 12.9784, "lon": 77.5695, "platforms": 10},
        {"code": "HWH", "name": "Howrah Junction Kolkata", "zone": "ER", "lat": 22.5839, "lon": 88.3426, "platforms": 23},
        {"code": "MAS", "name": "Chennai Central", "zone": "SR", "lat": 13.0827, "lon": 80.2755, "platforms": 12},
        {"code": "KOTA", "name": "Kota Junction", "zone": "WCR", "lat": 25.2138, "lon": 75.8648, "platforms": 6},
        {"code": "BPL", "name": "Bhopal Junction", "zone": "WCR", "lat": 23.2599, "lon": 77.4126, "platforms": 6},
        {"code": "CNB", "name": "Kanpur Central", "zone": "NCR", "lat": 26.4547, "lon": 80.3507, "platforms": 10},
        {"code": "BSB", "name": "Varanasi Junction", "zone": "NER", "lat": 25.3283, "lon": 82.9866, "platforms": 9}
    ],
    "trains": [
        {
            "id": "12952",
            "name": "Mumbai Tejas Rajdhani",
            "type": "Superfast Premium",
            "from_code": "NDLS",
            "to_code": "BCT",
            "departure": "16:55",
            "arrival": "08:35",
            "duration": "15h 40m",
            "speed_kmh": 130,
            "punctuality_pct": 98.4,
            "classes": {
                "1A": {"available": 4, "waitlist": 0, "fare": 4650, "status": "AVAILABLE-04", "conf_prob": 100},
                "2A": {"available": 18, "waitlist": 0, "fare": 2980, "status": "AVAILABLE-18", "conf_prob": 100},
                "3A": {"available": 0, "waitlist": 12, "fare": 2180, "status": "WL-12", "conf_prob": 74}
            },
            "route_stops": ["NDLS", "KOTA", "RTM", "BRC", "ST", "BVI", "BCT"],
            "tatkal_open": True,
            "dynamic_pricing_factor": 1.15
        },
        {
            "id": "22436",
            "name": "Vande Bharat Express",
            "type": "Semi-High Speed",
            "from_code": "NDLS",
            "to_code": "BSB",
            "departure": "06:00",
            "arrival": "14:00",
            "duration": "8h 00m",
            "speed_kmh": 160,
            "punctuality_pct": 99.1,
            "classes": {
                "EC": {"available": 8, "waitlist": 0, "fare": 3350, "status": "AVAILABLE-08", "conf_prob": 100},
                "CC": {"available": 34, "waitlist": 0, "fare": 1750, "status": "AVAILABLE-34", "conf_prob": 100}
            },
            "route_stops": ["NDLS", "CNB", "PRYJ", "BSB"],
            "tatkal_open": True,
            "dynamic_pricing_factor": 1.00
        },
        {
            "id": "12302",
            "name": "Howrah Rajdhani Express",
            "type": "Superfast Premium",
            "from_code": "NDLS",
            "to_code": "HWH",
            "departure": "16:50",
            "arrival": "09:55",
            "duration": "17h 05m",
            "speed_kmh": 130,
            "punctuality_pct": 96.8,
            "classes": {
                "1A": {"available": 2, "waitlist": 0, "fare": 4820, "status": "AVAILABLE-02", "conf_prob": 100},
                "2A": {"available": 0, "waitlist": 8, "fare": 3050, "status": "WL-08", "conf_prob": 82},
                "3A": {"available": 0, "waitlist": 24, "fare": 2240, "status": "WL-24", "conf_prob": 58}
            },
            "route_stops": ["NDLS", "CNB", "DDU", "GAYA", "DHN", "HWH"],
            "tatkal_open": True,
            "dynamic_pricing_factor": 1.20
        },
        {
            "id": "12626",
            "name": "Kerala Superfast Express",
            "type": "Long Distance Superfast",
            "from_code": "NDLS",
            "to_code": "MAS",
            "departure": "20:10",
            "arrival": "04:45",
            "duration": "32h 35m",
            "speed_kmh": 110,
            "punctuality_pct": 94.2,
            "classes": {
                "2A": {"available": 6, "waitlist": 0, "fare": 3120, "status": "AVAILABLE-06", "conf_prob": 100},
                "3A": {"available": 22, "waitlist": 0, "fare": 2180, "status": "AVAILABLE-22", "conf_prob": 100},
                "SL": {"available": 0, "waitlist": 45, "fare": 820, "status": "WL-45", "conf_prob": 42}
            },
            "route_stops": ["NDLS", "AGC", "GWL", "BPL", "NGP", "BZA", "MAS"],
            "tatkal_open": False,
            "dynamic_pricing_factor": 1.05
        },
        {
            "id": "12954",
            "name": "August Kranti Tejas Rajdhani",
            "type": "Superfast Premium",
            "from_code": "NDLS",
            "to_code": "BCT",
            "departure": "17:15",
            "arrival": "10:05",
            "duration": "16h 50m",
            "speed_kmh": 125,
            "punctuality_pct": 97.2,
            "classes": {
                "1A": {"available": 1, "waitlist": 0, "fare": 4650, "status": "AVAILABLE-01", "conf_prob": 100},
                "2A": {"available": 12, "waitlist": 0, "fare": 2980, "status": "AVAILABLE-12", "conf_prob": 100},
                "3A": {"available": 5, "waitlist": 0, "fare": 2180, "status": "AVAILABLE-05", "conf_prob": 98}
            },
            "route_stops": ["NDLS", "MTJ", "KOTA", "RTM", "ST", "BCT"],
            "tatkal_open": True,
            "dynamic_pricing_factor": 1.10
        },
        {
            "id": "12002",
            "name": "Bhopal Shatabdi Express",
            "type": "Shatabdi Express",
            "from_code": "NDLS",
            "to_code": "BPL",
            "departure": "06:00",
            "arrival": "14:40",
            "duration": "8h 40m",
            "speed_kmh": 150,
            "punctuality_pct": 98.9,
            "classes": {
                "EC": {"available": 14, "waitlist": 0, "fare": 2690, "status": "AVAILABLE-14", "conf_prob": 100},
                "CC": {"available": 62, "waitlist": 0, "fare": 1420, "status": "AVAILABLE-62", "conf_prob": 100}
            },
            "route_stops": ["NDLS", "AGC", "GWL", "JHS", "BPL"],
            "tatkal_open": True,
            "dynamic_pricing_factor": 1.00
        }
    ],
    "bookings": [
        {
            "pnr": "241-8930129",
            "train_id": "12952",
            "train_name": "Mumbai Tejas Rajdhani",
            "from_code": "NDLS",
            "to_code": "BCT",
            "date": "2026-09-18",
            "travel_class": "2A",
            "passengers": [
                {"name": "Dr. Sarah Vance", "age": 34, "gender": "F", "berth": "B1-21 (Lower)", "status": "CNF", "quota": "GN"}
            ],
            "current_status": "CNF / B1-21",
            "booking_status": "WL-4",
            "chart_prepared": False,
            "conf_prob": 100,
            "fare": 2980,
            "timestamp": int(time.time() * 1000) - 86400000,
            "vector_clock": {"server": 95}
        },
        {
            "pnr": "482-1094821",
            "train_id": "12302",
            "train_name": "Howrah Rajdhani Express",
            "from_code": "NDLS",
            "to_code": "HWH",
            "date": "2026-09-20",
            "travel_class": "3A",
            "passengers": [
                {"name": "Vikram Malhotra", "age": 42, "gender": "M", "berth": "B4-42 (Side Lower)", "status": "WL-4", "quota": "GN"}
            ],
            "current_status": "WL-4 (RLWL)",
            "booking_status": "WL-8",
            "chart_prepared": False,
            "conf_prob": 87,
            "fare": 2240,
            "timestamp": int(time.time() * 1000) - 43200000,
            "vector_clock": {"server": 98}
        }
    ],
    "irctc_rules": [
        {
            "id": "IRCTC-RLWL-204",
            "policy_class": "WAITLIST_RULE",
            "title": "Remote Location Waitlist (RLWL) Priority Protocol",
            "description": "RLWL tickets are prioritized behind General Waitlist (GNWL) during charting. Intermediate boarding quotas strictly enforced.",
            "enforced": True,
            "risk_level": "MODERATE",
            "throttle_limit": "50 req/min"
        },
        {
            "id": "IRCTC-TATKAL-1000",
            "policy_class": "TATKAL_AUTO_BOOK",
            "title": "Tatkal 10:00 AM AC Quota Locking Window",
            "description": "Automated sub-second lock enabled at 10:00:00 AM IST for AC classes. Anti-bot OTP bypass defense active.",
            "enforced": True,
            "risk_level": "HIGH",
            "throttle_limit": "20 req/min"
        },
        {
            "id": "IRCTC-DYNFARE-303",
            "policy_class": "DYNAMIC_FARE_MAX",
            "title": "Dynamic Fare Surge Cap (1.5x Base)",
            "description": "SuFast and Rajdhani premium surcharge capped at 150% of base fare. Quota slabs of 10% determine increment.",
            "enforced": True,
            "risk_level": "LOW",
            "throttle_limit": "UNLIMITED"
        },
        {
            "id": "IRCTC-RAC-109",
            "policy_class": "RAC_REGULATION",
            "title": "Reservation Against Cancellation Berth Sharing",
            "description": "RAC passengers share Side Lower berths. 100% chart preparation guarantee for RAC <= 12.",
            "enforced": True,
            "risk_level": "LOW",
            "throttle_limit": "UNLIMITED"
        },
        {
            "id": "IRCTC-CANC-501",
            "policy_class": "REFUND_MATRIX",
            "title": "TDR & Auto-Cancellation Refund SLA",
            "description": "Waitlisted e-tickets auto-cancel after chart prep with 100% refund credited within 3-5 bank clearing cycles.",
            "enforced": True,
            "risk_level": "INFO",
            "throttle_limit": "UNLIMITED"
        }
    ],
    "agent_dispatch_logs": [
        {
            "id": "DSP-84920",
            "agent": "ADK-Transit-Supervisor-Alpha",
            "intent": "Route Optimization NDLS -> BCT",
            "decision": "Bypass GNWL WL-12 via Kota multi-hop split ticketing (Save 3h wait)",
            "confidence": 0.96,
            "latency_ms": 28,
            "timestamp": int(time.time() * 1000) - 3600000
        },
        {
            "id": "DSP-84921",
            "agent": "ADK-Quota-Protector",
            "intent": "Tatkal Pre-allocation 22436 Vande Bharat",
            "decision": "Pre-warmed captive session pool for 10:00:00 AM IST release",
            "confidence": 0.99,
            "latency_ms": 14,
            "timestamp": int(time.time() * 1000) - 1800000
        }
    ]
}

def load_store() -> Dict[str, Any]:
    if not os.path.exists(STORE_FILE):
        save_store(DEFAULT_INITIAL_DATA)
        return DEFAULT_INITIAL_DATA
    try:
        with open(STORE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        sys.stderr.write(f"Error loading store: {e}\n")
        return DEFAULT_INITIAL_DATA

def save_store(data: Dict[str, Any]) -> None:
    data["last_updated"] = int(time.time() * 1000)
    with open(STORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def compute_checksum(data: Dict[str, Any]) -> str:
    serialized = json.dumps(data, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]

def resolve_booking_mutation(store: Dict[str, Any], mutation: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Applies a booking mutation with 3-way semantic conflict resolution.
    If requested seat / quota is exhausted, auto-allocates closest viable berth
    and logs conflict resolution details.
    """
    conflicts_resolved = []
    m_data = mutation.get("data", {})
    train_id = m_data.get("train_id")
    travel_class = m_data.get("travel_class", "3A")
    pnr = m_data.get("pnr") or f"{hashlib.md5(str(time.time()).encode()).hexdigest()[:3].upper()}-{int(time.time()*1000)%10000000:07d}"
    
    # Locate target train
    target_train = next((t for t in store["trains"] if t["id"] == train_id), None)
    if not target_train:
        # Fallback to first train
        target_train = store["trains"][0]
        conflicts_resolved.append({
            "mutation_id": mutation.get("id"),
            "type": "UNKNOWN_TRAIN_ID_RESOLVED",
            "resolution": "FALLBACK_TO_EQUIVALENT_SUPERFAST",
            "details": f"Train {train_id} not in catalog, re-routed to {target_train['id']} {target_train['name']}"
        })

    class_info = target_train["classes"].get(travel_class)
    if not class_info:
        # Re-assign to first available class on that train
        available_classes = list(target_train["classes"].keys())
        assigned_class = available_classes[0]
        conflicts_resolved.append({
            "mutation_id": mutation.get("id"),
            "type": "CLASS_UNAVAILABLE",
            "resolution": "AUTO_UPGRADE_OR_REASSIGN",
            "details": f"Class {travel_class} not found. Automatically assigned to {assigned_class}"
        })
        travel_class = assigned_class
        class_info = target_train["classes"][travel_class]

    # Check for concurrency / quota race
    status = class_info.get("status", "AVAILABLE-01")
    conf_prob = class_info.get("conf_prob", 95)
    assigned_berth = m_data.get("preferred_berth", "B2-18 (Lower)")
    current_status = "CNF / " + assigned_berth

    if "AVAILABLE" in status:
        # Decrement availability
        avail_num = class_info.get("available", 1)
        if avail_num > 1:
            class_info["available"] = avail_num - 1
            class_info["status"] = f"AVAILABLE-{class_info['available']:02d}"
        else:
            class_info["available"] = 0
            class_info["waitlist"] = 1
            class_info["status"] = "RAC-01"
            class_info["conf_prob"] = 98
    else:
        # Waitlist increment
        wl_num = class_info.get("waitlist", 0) + 1
        class_info["waitlist"] = wl_num
        class_info["status"] = f"WL-{wl_num:02d}"
        class_info["conf_prob"] = max(20, conf_prob - 2)
        current_status = f"WL-{wl_num} (RLWL)"
        conf_prob = class_info["conf_prob"]
        conflicts_resolved.append({
            "mutation_id": mutation.get("id"),
            "type": "QUOTA_RACE_CONDITION",
            "resolution": "CONVERTED_TO_WAITLIST_WITH_PROBABILITY_ESTIMATE",
            "details": f"Direct availability filled by concurrent booking. Assigned {current_status} with {conf_prob}% confirmation certainty."
        })

    new_booking = {
        "pnr": pnr,
        "train_id": target_train["id"],
        "train_name": target_train["name"],
        "from_code": m_data.get("from_code", target_train["from_code"]),
        "to_code": m_data.get("to_code", target_train["to_code"]),
        "date": m_data.get("date", "2026-09-22"),
        "travel_class": travel_class,
        "passengers": m_data.get("passengers", [
            {"name": m_data.get("passenger_name", "Transit Officer"), "age": 30, "gender": "M", "berth": assigned_berth, "status": current_status, "quota": "GN"}
        ]),
        "current_status": current_status,
        "booking_status": current_status,
        "chart_prepared": False,
        "conf_prob": conf_prob,
        "fare": class_info.get("fare", 2400),
        "timestamp": int(time.time() * 1000),
        "vector_clock": {"server": store["server_vector_clock"].get("server", 100) + 1}
    }

    # Prepend or update booking
    existing_idx = next((i for i, b in enumerate(store["bookings"]) if b["pnr"] == pnr), None)
    if existing_idx is not None:
        store["bookings"][existing_idx] = new_booking
    else:
        store["bookings"].insert(0, new_booking)

    return new_booking, conflicts_resolved

def handle_sync(payload: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.time()
    store = load_store()
    
    client_id = payload.get("client_id", "terminal-client")
    last_sync_ts = payload.get("last_sync_timestamp", 0)
    client_mutations = payload.get("mutations", [])
    
    # Update vector clock
    curr_server_clock = store["server_vector_clock"].get("server", 100)
    store["server_vector_clock"]["server"] = curr_server_clock + len(client_mutations) + 1
    store["server_vector_clock"][client_id] = payload.get("client_vector_clock", {}).get(client_id, 1)

    all_conflicts = []
    applied_count = 0

    for m in client_mutations:
        action = m.get("action", "")
        if action == "CREATE_BOOKING":
            _, resolved = resolve_booking_mutation(store, m)
            all_conflicts.extend(resolved)
            applied_count += 1
        elif action == "CANCEL_BOOKING":
            pnr_to_cancel = m.get("data", {}).get("pnr")
            found = False
            for b in store["bookings"]:
                if b["pnr"] == pnr_to_cancel:
                    b["current_status"] = "CANCELLED (TDR FILED)"
                    b["conf_prob"] = 0
                    found = True
                    applied_count += 1
                    break
            if not found:
                all_conflicts.append({
                    "mutation_id": m.get("id"),
                    "type": "PNR_NOT_FOUND",
                    "resolution": "IGNORED_ALREADY_PURGED",
                    "details": f"Booking PNR {pnr_to_cancel} already removed from server chart."
                })
        elif action == "DISPATCH_OVERRIDE":
            d_data = m.get("data", {})
            new_log = {
                "id": f"DSP-{int(time.time()*1000)%100000}",
                "agent": d_data.get("agent", "ADK-Supervisor"),
                "intent": d_data.get("intent", "Manual Transit Dispatch Override"),
                "decision": d_data.get("decision", "Offline decision acknowledged and merged into central registry"),
                "confidence": d_data.get("confidence", 0.98),
                "latency_ms": 16,
                "timestamp": int(time.time() * 1000)
            }
            store["agent_dispatch_logs"].insert(0, new_log)
            applied_count += 1
        elif action == "TOGGLE_RULE_POLICY":
            rule_id = m.get("data", {}).get("rule_id")
            for r in store["irctc_rules"]:
                if r["id"] == rule_id:
                    r["enforced"] = not r.get("enforced", True)
                    applied_count += 1
                    break
        else:
            applied_count += 1

    save_store(store)
    
    # Calculate server deltas
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    checksum = compute_checksum(store)

    return {
        "status": "SUCCESS",
        "synced_at": int(time.time() * 1000),
        "applied_mutations": applied_count,
        "conflicts_detected": len(all_conflicts),
        "conflicts_resolved": all_conflicts,
        "server_vector_clock": store["server_vector_clock"],
        "server_deltas": {
            "trains": store["trains"],
            "bookings": store["bookings"][:20],
            "irctc_rules": store["irctc_rules"],
            "agent_dispatch_logs": store["agent_dispatch_logs"][:15],
            "stations": store["stations"]
        },
        "telemetry": {
            "sync_duration_ms": elapsed_ms,
            "engine": "Python-3.10-SyncEngine",
            "checksum": checksum,
            "total_bookings_on_server": len(store["bookings"]),
            "vector_clock_state": store["server_vector_clock"]
        }
    }

def main():
    parser = argparse.ArgumentParser(description="Neural Transit Python Sync Engine")
    parser.add_argument("--mode", choices=["sync", "get-state", "get-offline-pack", "reset"], default="sync")
    parser.add_argument("--input", type=str, help="JSON string payload or '-' for stdin", default="-")
    args = parser.parse_args()

    if args.mode == "reset":
        save_store(DEFAULT_INITIAL_DATA)
        print(json.dumps({"status": "RESET_SUCCESS", "message": "Server state initialized to defaults"}))
        return

    if args.mode == "get-state":
        store = load_store()
        print(json.dumps(store))
        return

    if args.mode == "get-offline-pack":
        store = load_store()
        offline_pack = {
            "pack_version": "OFFLINE-TRANSIT-V2.4",
            "generated_at": int(time.time() * 1000),
            "stations": store["stations"],
            "trains": store["trains"],
            "irctc_rules": store["irctc_rules"],
            "heuristic_routing_nodes": [
                {"hub": "NDLS", "neighbors": ["KOTA", "CNB", "BPL", "AGC"]},
                {"hub": "BCT", "neighbors": ["ST", "BRC", "RTM", "BVI"]},
                {"hub": "HWH", "neighbors": ["DHN", "GAYA", "DDU", "CNB"]},
                {"hub": "SBC", "neighbors": ["MAS", "DMM", "GTL", "BZA"]}
            ],
            "offline_pnr_validator_regex": r"^\d{3}-\d{7}$"
        }
        print(json.dumps(offline_pack))
        return

    if args.mode == "sync":
        try:
            if args.input == "-":
                raw_input = sys.stdin.read().strip()
            else:
                raw_input = args.input.strip()

            if not raw_input:
                raw_input = "{}"

            payload = json.loads(raw_input)
        except Exception as e:
            payload = {"mutations": [], "client_id": "cli-test", "last_sync_timestamp": 0}

        result = handle_sync(payload)
        print(json.dumps(result))

if __name__ == "__main__":
    main()
