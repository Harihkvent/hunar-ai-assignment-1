# Assignment 3 — AI-Assisted Attendance System Without Smartphones

## 1. Problem Statement

> **“If there were no smartphones but LLMs exist/everything else exists except apps and you are an HR who has to track attendance of 1,000 people everyday in 100 locations, what would you do?”**

The challenge is to design a practical, reliable attendance system that works **without smartphones or employee attendance apps**, while allowing HR to track 1,000 employees across 100 locations every day.

The goal is not to recreate a smartphone application through another interface. The goal is to replace the smartphone/app layer with technologies that remain available under the stated constraints.

---

## 2. Constraints and Assumptions

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
- RFID / biometric attendance terminals where practical.
- Backend servers, databases, queues and schedulers.
- LLMs and Voice AI / speech-to-text / text-to-speech.

### Scale

- 1,000 employees.
- 100 locations.
- Daily attendance collection.

### Key design principle

> **LLMs understand human language; deterministic services decide authoritative attendance.**

---

## 3. Proposed Solution

### Telecom-First, Site-Aware Attendance Platform

Instead of building a smartphone attendance app, the system uses **basic telecom channels and physical workplace infrastructure** as the employee interaction layer.

Employees can record attendance through:

1. **Voice / IVR** — conversational and accessible from feature phones.
2. **SMS / USSD** — lightweight fallback where supported.
3. **RFID / biometric terminal** — preferred where stronger physical-presence verification is required.
4. **Site supervisor / landline workflow** — operational fallback for exceptional situations.

A central backend receives attendance events, validates them against employee, site, shift and attendance policy, stores an auditable record, and exposes the results to HR through a centralized dashboard.

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
                           │    PostgreSQL / DB    │
                           └───────────┬───────────┘
                                       │
                           ┌───────────▼───────────┐
                           │ Scheduler / Queue     │
                           │ Redis + Workers       │
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

For sites using telephony, an employee can call the configured attendance number from a basic phone.

```text
Employee
   │
   │ Calls attendance endpoint
   ▼
Telephony / IVR Gateway
   │
   ├── Caller number → employee lookup
   ├── Called endpoint → site context
   └── Timestamp → event time
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

Example:

> AI: “Please confirm that you are checking in for today’s shift.”
>
> Employee: “Yes, I have reached the site.”
>
> System: “Your attendance has been recorded.”

### 5.2 Physical Terminal Check-In

Where stronger physical-presence assurance is needed, a location can use a site-installed RFID or biometric terminal:

```text
Employee
   ↓
RFID / biometric terminal at Site 42
   ↓
Site gateway / local controller
   ↓
Central attendance service
```

The terminal is bound to the site in the system configuration, so the event carries both employee and site context.

---

## 6. Location Verification Without Smartphone GPS

Because smartphone GPS is unavailable, the system uses **site identity rather than device GPS** as the location signal.

### Preferred method — site-attached hardware

For higher-assurance locations:

```text
Employee → RFID / biometric terminal → Site gateway → Backend
```

The physical terminal is registered to a specific location.

### Lower-cost method — site-specific telephony

For sites where dedicated hardware is not practical:

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
- timestamp,
- employee-to-site assignment,
- additional verification such as a PIN.

### Important trade-off

A phone call alone is **not absolute proof of physical presence**, because a call can technically be placed from elsewhere. Therefore, high-assurance environments should use site-installed attendance hardware, while telephony is a lower-cost or fallback option.

---

## 7. Identity Verification and Proxy Attendance

A phone number identifies a device, not necessarily the human using it. The design therefore supports layered verification.

### Layer 1 — Registered phone number

Map the caller number to an employee record.

### Layer 2 — Personal PIN

Request a personal attendance PIN when stronger verification is required.

### Layer 3 — Optional voice verification

For high-security environments, voice verification may be added subject to applicable privacy and biometric-data policies.

### Layer 4 — Physical terminal verification

RFID or biometric terminals can provide stronger on-site identity assurance.

The organization can choose the required assurance level by site rather than forcing the same mechanism everywhere.

---

## 8. Why Use an LLM?

The LLM is an **intelligence layer**, not the authoritative attendance system.

### Good uses for the LLM

- Natural-language voice understanding.
- Multilingual interaction.
- Intent extraction.
- Exception classification.
- Human-readable explanations and summaries.
- HR natural-language queries.

Example employee response:

> “I am at the warehouse, but I will be about 15 minutes late because my bus was delayed.”

Voice AI converts the speech to text, and the LLM can extract:

```json
{
  "intent": "LATE_ARRIVAL",
  "eta_minutes": 15
}
```

The deterministic rules engine then checks the employee's shift and company policy before updating attendance.

### What the LLM should not decide

The LLM should not independently determine payroll-grade attendance, bypass identity checks, or directly write authoritative attendance records.

Those decisions belong to deterministic services and explicit business rules.

---

## 9. Attendance State Machine

Attendance is represented as explicit state transitions so the system is auditable.

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

---

## 10. Daily Automation Workflow

The system runs automatically every working day.

```text
Attendance window opens
        │
        ▼
Employee check-in events
Voice / SMS / USSD / Hardware
        │
        ▼
Events enter queue
        │
        ▼
Identity + site + shift validation
        │
        ▼
Normal cutoff reached
        │
        ▼
Find employees without valid check-in
        │
        ▼
Automated follow-up
        │
        ▼
Voice / SMS exception handling
        │
        ▼
HR dashboard updated
```

Attendance windows and cutoffs are configurable by location and shift.

---

## 11. Missing Attendance and AI Follow-Up

At the cutoff time, the system compares the expected roster with verified attendance events.

Example:

```text
Expected employees      1,000
Verified check-ins        920
Missing                   80
```

The 80 missing employees enter a follow-up queue.

Voice AI can ask:

> “We haven't received your attendance for today. Are you present, late, on leave, or facing an issue?”

Example response:

> “I am on my way. I'll reach in 20 minutes.”

The LLM extracts the intent and ETA, and the rules engine decides the resulting attendance state according to company policy.

---

## 12. Fallback Channels

A robust system should not depend on one communication mechanism.

### Primary

Voice / IVR or site-installed attendance hardware.

### Secondary

SMS / USSD for low-bandwidth situations or when voice interaction fails.

### Operational fallback

A site supervisor can use a landline or designated workflow to report exceptions such as approved leave or equipment failure.

---

## 13. Handling Failures

The system should assume failures will occur.

### Telephony failure

Retry through the provider or use a fallback communication channel.

### Employee does not answer

Move the record to `PENDING` and trigger follow-up according to policy.

### Network interruption

Queue events and process them when connectivity returns where local hardware supports offline buffering.

### Duplicate event

Use an idempotency key, such as employee + date + event source ID, to prevent duplicate attendance records.

### Provider outage

Keep a durable queue and support a secondary provider where business requirements justify it.

### Hardware failure

Fall back to site telephony or supervisor-assisted exception handling.

---

## 14. Scale for 1,000 Employees / 100 Locations

Attendance processing should be asynchronous.

Instead of processing 1,000 operations sequentially:

```text
Daily Attendance Campaign
          │
          ▼
     Jobs / Events
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

The queue provides concurrency control, retries and rate limiting.

At the initial scale, a small API fleet, relational database, queue and worker pool are sufficient. If the organization grows, API instances and queue consumers can be scaled horizontally.

---

## 15. HR Dashboard

The employee interaction remains intentionally simple. The complexity is centralized for HR.

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

The AI layer can also help HR investigate attendance data using natural language.

Example questions:

> “Which locations have unusually high absenteeism today?”

> “Who has not checked in after the second reminder?”

> “Show me today's late arrivals at Site 42.”

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

The LLM should not have unrestricted access to production SQL or sensitive data. Requests should pass through an approved data-access layer.

---

## 17. Security and Privacy

Because attendance data is employee data, the platform should include:

- TLS for network communication.
- Authentication and role-based access control.
- Hashed attendance PINs.
- Secure secret management.
- Audit logs for administrative changes.
- Idempotency and replay protection for inbound events/webhooks where applicable.
- Data minimization and retention policies.
- Additional privacy controls for voice biometric data, if enabled.

Example roles:

```text
HR_ADMIN
HR_MANAGER
LOCATION_MANAGER
EMPLOYEE
SYSTEM
```

A location manager should only see employees and events relevant to their authorized location.

---

## 18. Example End-to-End Scenario

### Employee: Raj
### Assigned location: Site 42
### Shift: 09:00–18:00

**08:52** — Raj arrives at Site 42.

**08:53** — Raj uses the configured attendance mechanism.

**08:53** — The system receives an event containing employee identity, site context, timestamp and source.

**08:53** — Identity and shift rules are validated.

**08:53** — Attendance becomes `PRESENT`.

**09:15** — The system identifies employees without valid check-ins.

**09:20** — AI follows up with missing employees.

**09:23** — One employee explains in natural language that they are delayed.

**09:23** — LLM extracts `LATE_ARRIVAL` and the reported ETA.

**09:24** — The rules engine applies the configured attendance policy.

**09:30** — HR sees the updated organization-wide status.

---

## 19. Design Trade-offs

### Telephony vs. hardware

Telephony is easier to deploy and works with basic phones, but it provides weaker physical-presence assurance. RFID/biometric hardware provides stronger on-site verification but introduces hardware deployment and maintenance costs.

### LLM vs. deterministic rules

LLMs make interaction flexible and multilingual, but deterministic rules are more predictable for attendance policy enforcement and auditability.

### Single channel vs. multi-channel

A single channel is simpler, but multiple channels improve resilience when employees have device or connectivity problems.

### Centralized vs. site autonomy

A centralized platform gives HR one source of truth, while optional site-level buffering improves resilience during temporary network failures.

---

## 20. Why This Solves the Challenge

The design directly addresses the challenge:

- **No smartphones:** employees use feature phones and/or site equipment.
- **No apps:** the employee interaction is telecom- or hardware-based.
- **LLMs available:** LLMs provide natural-language understanding, multilingual interaction and HR intelligence.
- **1,000 employees:** queue-based automation processes attendance at scale without manual HR calling.
- **100 locations:** employee, site and shift are first-class entities in the attendance system.
- **Daily operation:** scheduled attendance windows and automated follow-up run every working day.
- **Reliability:** multiple channels, retries, idempotency and exception handling prevent a single failure from stopping the process.
- **Auditability:** authoritative attendance decisions are made by deterministic services and stored with event history.

### Final architectural principle

> **Use telecom and site infrastructure to replace the smartphone/app interface, use Voice AI and LLMs to understand people naturally, and use deterministic systems to maintain trustworthy attendance records.**
