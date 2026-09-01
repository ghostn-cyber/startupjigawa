# Milestone Task File: `05-sms-ussd-otp-fallback-task.md`

## Milestone 5: Low-Bandwidth SMS & USSD OTP Fallback Engine

* **Associated Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria.
* **Phase Objective:** Implement a lightweight, resilient SMS and USSD OTP verification pipeline designed specifically for rural field enumerators, trainees, and smallholder farmers operating under intermittent or low-bandwidth connectivity constraints across Jigawa State.

---

## Task Breakdown & Action Items

### Task 5.1: Redis OTP Generation & TTL Management

* [x] **Ephemeral Token Generator:**
* Implement cryptographic 6-digit numeric OTP generation service.
* Store OTP hashes in Redis with a strict 5-minute TTL (`EXPIRE otp:phone:<number> 300`) and enforce a maximum attempt threshold (3 failed tries before 15-minute lockout) to mitigate brute-force attacks.


* [x] **Feature Flag Enforcement:**
* Tie OTP generation and verification directly to the runtime environment feature flag (`ENABLE_SMS_OTP=true/false`), ensuring local testing environments can bypass live SMS dispatch while production workflows enforce strict verification.



### Task 5.2: SMS Gateway Integration Layer (`packages/sms-client` or local service)

* [x] **Provider Adapter Interface:**
* Build an abstracted SMS delivery service supporting local Nigerian gateway providers (e.g., Termii, Infobip, or Twilio) with simulated fallbacks.


* [x] **USSD Simulation & Fallback Handling:**
* Define USSD gateway webhook handlers (`POST /api/v1/ussd/callback`) allowing feature phone users to request and confirm authentication codes via shortcodes (e.g., `*347*77#`).



### Task 5.3: Authentication Controller & UI Flow Integration

* [x] **OTP Challenge State:**
* Update `apps/auth-service/src/controllers/auth.controller.ts` to handle two-step login: if `ENABLE_SMS_OTP` is enabled or user role requires secondary challenge, issue an OTP and handle two-stage verification.


* [x] **Frontend Verification Form:**
* Build mobile-optimized input support for 6-digit OTP entry with real-time toggle between security password and SMS/USSD OTP fallback.



### Task 5.4: Integration Testing & Verification

* [x] **Redis & Flow Testing:**
* Write automated tests verifying OTP generation, Redis TTL expiration, brute-force rate limiting, and successful token exchange upon correct code submission.



---

## Milestone 5 Completion & Sign-Off Criteria

* **Resilient Verification:** The OTP pipeline successfully issues, validates, and expires verification codes in Redis.
* **Feature Flag Stability:** Setting `ENABLE_SMS_OTP=false` seamlessly bypasses SMS dispatch for automated testing, while `ENABLE_SMS_OTP=true` enforces rigorous rural field authentication.
