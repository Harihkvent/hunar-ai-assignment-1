# Assignment 3 — AI-Assisted Attendance System Without Smartphones

## 1. Problem Statement

> If there were no smartphones but LLMs exist/everything else exists except apps and you are an HR who has to track attendance of 1,000 people every day in 100 locations, what would you do?

The problem is to design a practical attendance system that works at scale **without requiring smartphones or employee mobile applications**, while still giving HR a reliable, centralized view of attendance across 100 locations.

---

## 2. Constraints

### Employee-side constraints

- No smartphones.
- No native or web attendance application for employees.
- No smartphone GPS-based attendance.
- Employees may still use basic phones and ordinary telecom services.

### Available technology

- Basic feature phones.
- Voice calls / IVR.
- SMS and USSD where supported.
- Landlines and site-level telephony.
- RFID / biometric attendance hardware where appropriate.
- Backend servers, databases, queues and automation.
- LLMs and Voice AI / speech-to-text / text-to-speech.

### Scale

- 1,000 employees.
- 100 locations.
- Daily attendance collection.

---

## 3. Proposed Solution

### Telecom-First, Site-Aware Attendance Platform

Instead of building a smartphone attendance app, the system uses **basic telecom channels and physical workplace infrastructure** as the employee interaction layer.

Employees can record attendance through:

1. **Voice / IVR** — primary conversational option.
2. **SMS / USSD** — low-bandwidth fallback.
3. **RFID / biometric terminal** — strongest physical-presence option for locations where hardware is practical.
4. **Site supervisor / landline workflow** — operational fallback for exceptional cases.

A central backend validates every attendance event and provides HR with a real-time dashboard.

The core architectural principle is:

> **LLMs understand human language; deterministic systems decide attendance.**

---

## 4. High-Level Architecture

```text
                           ┌───────────────────────┐
                           │      HR / Managers    │
                           │     Web Dashboard     │
                           └───────────┬───────────┘
                                       │ HTTPS / API
                                       ▼
                           ┌───────────────────────┐
                           │      API Layer        │
                           │       FastAPI         │
                           └───────────┬───────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │ Employee /      │       │ Attendance /    │       │ AI / Exception  │
   │ Location Service│       │ Rules Engine    │       │ Service          │
   └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
                           ┌───────────────────────┐
                           │   PostgreSQL / DB     │
                           └───────────┬───────────┘
                                       │
                           ┌───────────▼───────────┐
                           │   Queue / Scheduler    │
                           │    Redis / Workers     │
                           └───────────┬───────────┘
                                       │
              ┌────────────────────────┼─────────────────────────┐
              │                        │                         │
              ▼                        ▼                         ▼
        Voice / IVR                 SMS / USSD           Site Hardware
              │                                                │
              ▼                                                ▼
        Basic Phones                                      RFID / Biometric
        / Landlines                                        Terminals
              │                                                │
              └───────────────────┬────────────────────────────┘
                                  ▼
                           Attendance Events
                                  │
                                  ▼
                       Validation + Audit Trail
```

---

## 5. Employee Attendance Flow

### 5.1 Voice / IVR Check-In

An employee arrives at their assigned location and uses a basic phone.

Example:

```text
Employee at Site 42
        │
        │ Calls attendance number
        ▼
Telephony / IVR Gateway
        │
        ├── Caller number → employee lookup
        ├── Called endpoint → site identification
        └── Timestamp → attendance event time
        │
        ▼
Identity Verification
        │
        └── PIN / voice challenge when required
        │
        ▼
Voice AI + LLM
        │
        └── Interprets confirmation / exception
        │
        ▼
Attendance Rules Engine
        │
        ├── Correct employee?
        ├── Correct assigned site?
        ├── Scheduled today?
        ├── Valid attendance window?
        └── Duplicate check?
        │
        ▼
Attendance Database
        │
        └── PRESENT / LATE / EXCEPTION
```

Example conversation:

> AI: "Please confirm that you are checking in for today's shift."
>
> Employee: "Yes, I have reached the site."
>
> System: "Your attendance has been recorded at 08:53 AM."

---

## 6. Location Verification Without Smartphone GPS

Location is one of the main challenges because smartphone GPS is unavailable.

The design therefore makes the **workplace itself part of the attendance proof**.

### Preferred method — site-attached hardware

Where strong physical-presence assurance is required:

```text
Employee
   ↓
RFID / biometric terminal at Site 42
   ↓
Site gateway
   ↓
Central attendance system
```

Because the terminal is physically installed at Site 42, the attendance event is inherently associated with that site.

### Lower-cost method — site-specific telephony

For locations where hardware is not practical:

```text
Employee phone
      ↓
Site-specific attendance endpoint
      ↓
Telephony gateway
      ↓
Central backend
```

The backend combines:

- registered caller identity,
- destination/site identity,
- time,
- employee-to-site assignment,
- additional verification such as PIN.

This avoids requiring smartphone GPS.

### Important trade-off

A phone call by itself is **not absolute proof of physical presence** because a call can technically be placed from another location. Therefore, high-security locations should use site-installed RFID/biometric hardware, while telephony can be used as a lower-cost mechanism or fallback.

---

## 7. Identity Verification & Proxy Attendance

A basic phone number identifies a device, not necessarily the human holding it. The design therefore uses layered verification.

### Layer 1 — Registered phone number

The caller number is mapped to an employee record.

### Layer 2 — Personal PIN

The system can request a PIN during the attendance interaction.

### Layer 3 — Optional voice verification

For high-security environments, a short voice sample can be compared with a registered voice profile, subject to the organization's privacy and biometric-data policies.

### Layer 4 — Physical terminal verification

RFID or biometric terminals can be used where stronger on-site identity assurance is needed.

The architecture supports different security levels by location rather than forcing the same mechanism everywhere.

---

## 8. Why Use an LLM?

The LLM is an **intelligence layer**, not the source of truth for attendance.

### Good uses for the LLM

- Natural-language voice understanding.
- Multilingual interaction.
- Intent extraction.
- Exception classification.
- Human-readable explanations and summaries.
- HR natural-language queries.

Example:

Employee says:

> "I'm at the warehouse, but I'll be about 15 minutes late because my bus was delayed."

Voice AI converts speech to text.

The LLM converts it into structured intent:

```json
{
  "intent": "LATE_ARRIVAL",
  "eta_minutes": 15
}
```

The deterministic rules engine then evaluates company policy and updates the attendance state.

### What the LLM should not decide

The LLM should not independently determine payroll-grade attendance, bypass identity checks, or directly write authoritative attendance records.

Those decisions belong to deterministic services and explicit business rules.

---

## 9. Attendance State Machine

Attendance is represented as an explicit state transition model.

```text
                ┌──────────────┐
                │   EXPECTED   │
                └──────┬───────┘
                       │
             valid check-in
                       ▼
                ┌──────────────┐
                │   PRESENT    │
                └──────┬───────┘
                       │
                   check-out
                       ▼
                ┌──────────────┐
                │  COMPLETED   │
                └──────────────┘

EXPECTED ── no check-in ──► PENDING

PENDING ── late confirmation ──► LATE

PENDING ── approved leave ──► EXCUSED

PRESENT / PENDING ── suspicious event ──► UNDER_REVIEW
```

This makes the system auditable and easier to integrate with payroll and HR workflows.

---

## 10. Daily Automation Workflow

The system should run automatically every working day.

```text
08:30
Attendance window opens
        │
        ▼
Employees check in
Voice / SMS / USSD / Hardware
        │
        ▼
Events enter processing queue
        │
        ▼
Identity + site + shift validation
        │
        ▼
09:15
Normal check-in cutoff
        │
        ▼
Find missing employees
        │
        ▼
09:20
Automated follow-up
        │
        ▼
Voice / SMS exception handling
        │
        ▼
HR dashboard updated
```

Times are configurable per location and shift.

---

## 11. Missing Attendance & AI Follow-Up

At the cutoff time, the system compares the expected roster with verified attendance events.

Example:

```text
Expected employees      1,000
Verified check-ins        920
Missing                   80
```

The 80 missing employees enter a follow-up queue.

Voice AI can ask:

> "We haven't received your attendance for today. Are you present, late, on leave, or facing an issue?"

The employee can respond naturally.

Example:

> "I'm on my way. I'll reach in 20 minutes."

The LLM extracts:

```text
Intent: LATE_ARRIVAL
ETA: 20 minutes
```

The attendance rules engine then applies the company's policy.

---

## 12. Fallback Channels

A robust system should not depend on one communication mechanism.

### Primary

Voice / IVR or site-installed attendance hardware.

### Secondary

SMS / USSD for low-bandwidth situations or when voice interaction fails.

### Operational fallback

A site supervisor can use a landline or designated workflow to report exceptions, such as approved leave or equipment failure.

This creates redundancy without requiring smartphones.

---

## 13. Handling Failures

The system should assume failures will occur.

### Telephony failure

Retry through the provider or fallback channel.

### Employee does not answer

Move the record to `PENDING` and trigger follow-up.

### Network interruption

Queue the event and process it when connectivity returns where the local hardware supports offline buffering.

### Duplicate attendance event

Use an idempotency key such as employee + date + event source ID to prevent duplicate records.

### Provider outage

Keep a durable queue and support a secondary communication provider where business requirements justify it.

### Hardware failure

Fall back to site telephony or supervisor-assisted exception handling.

---

## 14. Scale for 1,000 Employees / 100 Locations

The system should be asynchronous.

Instead of processing 1,000 calls sequentially:

```text
Daily Attendance Campaign
          │
          ▼
     1,000 events/jobs
          │
          ▼
       Queue
          │
   ┌──────┼──────┐
   ▼      ▼      ▼
Worker  Worker  Worker
   │      │      │
   └──────┼──────┘
          ▼
Telephony / SMS / Site Hardware
```

This allows concurrency limits, retries and rate control.

At the initial scale, a small set of API instances, a relational database, Redis and worker processes are sufficient. If the organization grows substantially, API workers and queue consumers can be scaled horizontally.

---

## 15. HR Dashboard

The employee interaction is intentionally simple. The complexity is centralized for HR.

Example:

```text
                 TODAY'S ATTENDANCE

Expected                 1,000
Present                     904
Late                         41
On Leave                    32
Absent                      18
Pending                      5

Attendance Rate           90.4%
```

Location view:

```text
Location    Expected    Present    Late    Status
----------------------------------------------------
Site 01        10          10       0       OK
Site 02         8           7       1       Review
Site 03        14          11       2       Review
...
Site 100        9           9       0       OK
```

HR can drill down from:

**Organization → Location → Employee → Attendance Events**

---

## 16. LLM-Powered HR Assistant

The same AI layer can help HR investigate attendance data using natural language.

Example questions:

> "Which locations have unusually high absenteeism today?"

> "Who has not checked in after the second reminder?"

> "Show me today's late arrivals at Site 42."

Architecture:

```text
HR Question
    ↓
LLM intent / query generation
    ↓
Controlled analytics layer
    ↓
Attendance database
    ↓
Structured result
    ↓
LLM explanation
```

The LLM should not have unrestricted access to production SQL or sensitive data. Queries should pass through an approved data-access layer.

---

## 17. Security & Privacy

Because attendance data is employee data, the platform should include:

- TLS for all network communication.
- Authentication and role-based access control.
- Hashed attendance PINs.
- Secret management for API credentials.
- Audit logs for administrative changes.
- Idempotency and replay protection for inbound events/webhooks.
- Data minimization and retention policies.
- Additional privacy controls for any voice biometric data.

Example roles:

```text
HR_ADMIN
HR_MANAGER
LOCATION_MANAGER
EMPLOYEE
SYSTEM
```

A location manager should only see the employees and events relevant to their location.

---

## 18. Example End-to-End Scenario

### Employee: Raj
### Assigned location: Site 42
### Shift: 09:00–18:00

**08:52** — Raj arrives at Site 42.

**08:53** — Raj uses the configured attendance mechanism.

**08:53** — The system receives:

```text
Employee identity → Raj
Location → Site 42
Time → 08:53
Source → Voice / RFID / biometric
```

**08:53** — Identity and shift rules are validated.

**08:53** — Attendance becomes `PRESENT`.

**09:15** — System identifies employees without valid check-ins.

**09:20** — AI follows up with missing employees.

**09:23** — One employee explains in natural language that they are delayed.

**09:23** — LLM extracts `LATE_ARRIVAL`.

**09:24** — Rules engine applies the attendance policy.

**09:30** — HR dashboard shows the updated organization-wide status.

---

## 19. Design Trade-offs

### Telephony vs. hardware

Telephony is cheaper and easier to deploy but provides weaker physical-presence assurance. RFID/biometric hardware provides stronger physical presence but has deployment and maintenance costs.

### LLM vs. deterministic rules

LLMs make the interaction flexible and multilingual, but deterministic rules are more reliable for policy enforcement and auditability.

### Single channel vs. multi-channel

A single channel is simpler, but multiple channels provide resilience when employees have connectivity or device problems.

### Centralized vs. site autonomy

A centralized platform gives HR one source of truth, while lightweight site-level buffering can improve resilience during temporary network failures.

---

## 20. Why This Solves the Challenge

The design directly addresses the constraints in the problem statement:

- **No smartphones:** employees can use basic phones or site equipment.
- **No apps:** the employee interaction is telecom- or hardware-based.
- **No smartphone GPS:** location is associated with site infrastructure instead of an app GPS signal.
- **LLMs exist:** they are used for natural-language understanding, multilingual interaction, exception handling and HR analytics.
- **1,000 employees:** daily processing is automated through scheduling and queues.
- **100 locations:** each site has its own employees, shifts and attendance mechanisms while HR sees one centralized platform.
- **HR needs reliable records:** deterministic validation, state transitions, audit logs and exception handling maintain the authoritative attendance record.

### Final Principle

> **Use the simplest available technology at the employee side, and put the intelligence and operational complexity in the centralized platform.**

The employee does not need a smartphone or an app. The system still gives HR a scalable, auditable and intelligent attendance platform for 1,000 employees across 100 locations.
