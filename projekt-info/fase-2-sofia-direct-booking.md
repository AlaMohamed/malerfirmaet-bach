# Fase 2 — Sofia fuld direkte booking via Google Calendar API

**Status**: Plan godkendt, implementeres senere.
**Forudsætning**: Fase 1 (Sofia sender pre-fyldt Calendly-link efter samtalen) skal være live + stabil først.
**Beslutninger taget**: 13. maj 2026

---

## Mål

Sofia gennemfører hele booking-flowet *under* opkaldet — uden at kunden behøver klikke noget bagefter. Modellen som top-tier voice-agenter (DoorDash, Klarna, Vodafone, Replit) bruger.

```
Kunde ringer med Sofia
   ↓
Sofia tjekker availability   →  Google Calendar freebusy API
Sofia booker direkte         →  Google Calendar events.insert
Sofia sender e-mail-bekræftelse  →  Resend
   ↓
Kunde lægger på — booking er allerede i Adams kalender
```

---

## Arkitektur

Tre Retell Custom Functions kalder vores Next.js-API:

| Function | Endpoint | Eksterne API'er |
|---|---|---|
| `check_availability(date_range, duration_min)` | `/api/sofia/availability` | Google Calendar freebusy |
| `book_appointment(name, phone, email, datetime, postnr, projekt_beskrivelse)` | `/api/sofia/book` | Google Calendar events.insert + Airtable |
| `send_confirmation(email, datetime, details)` | `/api/sofia/confirm` | Resend |

Eventet oprettes i **samme** kalender Calendly bruger (`Malerfirmaet Bach ApS — Møder`) — så Adam ser én samlet oversigt uanset om bookingen kom via web (Calendly) eller telefon (Sofia direkte).

---

## Beslutninger truffet

### 1. Confirmation-kanaler → **(A) Kun e-mail**
- Lavest pris, ingen Twilio SMS-aftale nødvendig
- Sendes via Resend mens kunden stadig er i telefonen
- E-mail indeholder mødetid, adresse, Adam's kontakt, "Tilføj til kalender"-knap

### 2. Hvordan annullerer kunden senere → **(A) Aflysnings-link i e-mailen**
- Hver event får et unikt token i URL: `https://malerfirmaetbach.dk/aflys?token=xyz123`
- Side viser bookingdetaljer + bekræftelses-knap → sletter event i Google Calendar + opdaterer Airtable
- Kunden behøver ikke ringe Adam manuelt

### 3. Ingen ledige tider i kundens ønske-vindue → **(A) Sofia foreslår 3 nærmeste alternativer**
- `check_availability` returnerer altid 3 forslag (selv hvis ikke i ønskede vindue)
- Sofia siger fx: *"Tirsdag formiddag er fuldt, men tirsdag 15:00 er ledig, eller onsdag formiddag 09:30 eller torsdag 11:00 — hvilken passer dig?"*

### 4. Service-område-tjek → **(B) Sofia tager alle bookinger**
- Postnummer-whitelist er IKKE aktiveret i fase 2
- Adam vurderer manuelt om opgaven ligger for langt væk
- Begrundelse: Bach har taget Novo Kalundborg + Jyderup-projekter, så stivt postnummer-filter ville have afvist gyldige kunder

### 5. Buffer-tid mellem bookinger → **(A) Fast 30 min buffer før og efter**
- Når Sofia booker fx 14:00–14:30 reserveres reelt 13:30–15:00 i kalenderen
- Standard for håndværkere der kører ud
- Buffer kan justeres pr. opgavetype senere

---

## Implementations-tjekliste (når fase 2 startes)

- [ ] Google Service Account oprettet (samme som til Drive-upload)
- [ ] Adams kalender "Malerfirmaet Bach ApS — Møder" delt med service account-emailen (Editor-rolle)
- [ ] `/api/sofia/availability` endpoint — kalder freebusy, returnerer 3 forslag
- [ ] `/api/sofia/book` endpoint — opretter event m. buffer + Airtable-record
- [ ] `/api/sofia/confirm` endpoint — sender Resend-mail med iCal-attachment
- [ ] Custom Functions konfigureret i Retell, peger på ovenstående endpoints
- [ ] Sofia's prompt opdateret til at bruge functions (først `check_availability`, så `book_appointment`, så `send_confirmation`)
- [ ] `/aflys?token=...` side til kunde-aflysning
- [ ] Aflysnings-token genereret + gemt i Airtable pr. booking
- [ ] Test-flow: Web-call i Retell → verify event i Adams kalender → verify bekræftelse + aflysnings-link i e-mail
- [ ] Privatlivspolitik opdateret med ny dataflow

---

## Estimeret kompleksitet
- Backend API-endpoints: ~6 timers udvikling
- Retell prompt + Custom Functions opsætning: ~2 timer
- Aflysnings-side: ~2 timer
- Test + iteration: ~2 timer
- **Total**: ~12 timer

---

*Bevaret som godkendt fase 2-plan. Fase 1 går live først.*
