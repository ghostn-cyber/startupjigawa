# API Interfacing: Trainee & M&E Tracker Engine (`02-tracker-engine.md`)

## 1. Overview & Objectives
The beneficiary and monitoring-and-evaluation (M&E) tracking engine (`tracker.startupjigawa.com`) provides secure API endpoints to monitor program delivery, participant progression, employment outcomes, and longitudinal impact across Startup Jigawa Ltd's ecosystem[cite: 1]. It serves as the primary system of record for tracking the 50,000+ trained beneficiaries[cite: 1] across diploma pathways, national digital-skills initiatives (3MTT, NJFP), and community outreach programs[cite: 1].

---

## 2. Core API Endpoints

### A. Beneficiary Ingestion & Management
* **`POST /api/v1/beneficiaries/register`**
  * *Description:* Registers a new participant into a designated program track (e.g., Digital Talent, Civic Tech, Climate & Idea Lab)[cite: 1].
  * *Request Body (JSON):* `first_name`, `last_name`, `phone_number`, `gender`, `lga_origin`, `beneficiary_segment` (Youth, Women, Farmer, MSME, Public Servant, Citizen)[cite: 1], `program_id`.
* **`GET /api/v1/beneficiaries/{id}`**
  * *Description:* Retrieves a consolidated profile of a registered participant, including enrollment history, attendance records, and certification status.
* **`PATCH /api/v1/beneficiaries/{id}/status`**
  * *Description:* Updates a beneficiary's progression milestone (e.g., Foundation $\rightarrow$ Applied Practice $\rightarrow$ Capstone Project)[cite: 1].

### B. M&E Metrics & Aggregation Engine
* **`GET /api/v1/metrics/dashboard`**
  * *Description:* Aggregates real-time Key Performance Indicators (KPIs) across Startup Jigawa's six impact tracking areas: Talent, Technology, Civic, Research, Entrepreneurship, and Partnerships[cite: 1].
  * *Response (JSON):* Summary counts of people trained, completion rates, active pilots, products built, and institutional collaborations[cite: 1].
* **`POST /api/v1/metrics/surveys/sync`**
  * *Description:* Synchronizes offline field survey data, community needs assessments, and endline study responses gathered by field enumerators[cite: 1].

### C. Alumni & Employment Outcome Tracking
* **`POST /api/v1/alumni/outcomes`**
  * *Description:* Records post-training employment data, enterprise creation, or digital commerce revenue milestones for graduated participants[cite: 1].
  * *Request Body (JSON):* `beneficiary_id`, `outcome_type` (Employed, Entrepreneur, Freelancer, Further Education), `organization_name`, `verification_status`.

---

## 3. Data Integrity & Reporting Compliance
* **Access Control:** All API access is authenticated via OIDC/OAuth2 tokens issued by `auth.startupjigawa.com`. Services are implemented in TypeScript on Node.js v18+ and use Prisma ORM for PostgreSQL v15 persistence.
* **Auditability:** Modifications to beneficiary data generate immutable audit records persisted alongside transactional state in PostgreSQL; audit indexes are surfaced for external evaluation and donor due-diligence[cite: 1].