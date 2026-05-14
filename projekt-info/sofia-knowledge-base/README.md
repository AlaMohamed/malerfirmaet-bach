# Sofia Knowledge Base

Disse 6 markdown-dokumenter uploades til Retell's **Knowledge Base** for Sofia, så hun kan slå op i baggrundsinformation under samtaler.

## Hvordan uploader du dem?

1. Login på Retell: [https://app.retellai.com](https://app.retellai.com)
2. Venstre menu → **Knowledge Base**
3. Klik **"+ Create Knowledge Base"** (eller **"+ Add Document"**)
4. Upload én efter én — eller alle på én gang hvis Retell understøtter batch-upload
5. **Link Knowledge Base'en til Sofia**:
   - Gå til **Agents → Sofia**
   - Find **"Knowledge Base"**-feltet
   - Vælg den nyoprettede knowledge base
   - Klik **Publish**

## Indholdet

| # | Fil | Hvad det dækker | Bruges når kunden... |
|---|---|---|---|
| 1 | `01-firma-info.md` | Stamdata, indehaver, åbningstider, referencer | …spørger om firmaet selv |
| 2 | `02-ydelser-detaljer.md` | Detaljeret beskrivelse af 6 services + materialer | …spørger om en specifik ydelse |
| 3 | `03-faq-udvidet.md` | 30+ FAQ om pris, tid, kvalitet, praktiske ting | …stiller et generelt spørgsmål |
| 4 | `04-tidligere-projekter.md` | Reference-projekter (Hotel Mayfair, Novo, m.fl.) | …spørger om eksempler |
| 5 | `05-tilbuds-proces.md` | 4-trins proces fra besigtigelse til aflevering | …spørger "hvad sker der nu?" |
| 6 | `06-privatliv-faq.md` | AI-samtykke, dataopbevaring, GDPR | …er bekymret om privatliv |

## Hvordan Sofia bruger Knowledge Base

Når kunden stiller et spørgsmål, søger Sofia automatisk i alle uploadede dokumenter for relevant info. Hun **citerer ikke** dokumentet direkte — hun bruger informationen som baggrund og svarer naturligt.

Eksempel:

**Kunde**: *"Hvilken slags maling bruger I?"*

**Sofia** (efter intern søgning i 02-ydelser-detaljer.md): *"Vi bruger anerkendte mærker som Flügger, Beck & Jørgensen og Sadolin. Vi vælger malingstype efter rummets brug — fx slidstærk vandbestandig maling til vådrum og børneværelser. Hvis du har specifikke ønsker er det noget Adam kan tale mere konkret om ved besigtigelsen."*

## Vedligehold

- Når du ændrer pris, tilføjer en service, eller får en ny stor kunde — opdater den relevante fil
- Geninducer Knowledge Base'en i Retell efter ændringer
- Test ved at stille det nye spørgsmål til Sofia i web-playground

## Bemærk — info du selv skal verificere før upload

Følgende detaljer i dokumenterne har jeg fyldt ud med standardværdier baseret på branchen. Tjek og ret hvis det ikke er nøjagtigt:

- **Betalingsbetingelser** (50/50 for privat, 30 dage for erhverv) → ret hvis Bach har andre vilkår
- **Reklamationsperiode** (5 år) → typisk for malere, men bekræft Adams faktiske policy
- **Maling-mærker** (Flügger, Beck & Jørgensen, Sadolin) → bekræft Bachs faktiske leverandører
- **Tids-estimater** (1-2 dage pr. rum osv.) → vejledende — kan justeres
- **MobilePay-accept** → bekræft om Bach accepterer dette

Når du har rettet evt. unøjagtigheder, re-upload dokumenterne til Retell.
