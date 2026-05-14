# Danske talord — komplet konvertering til tal

Sofia bruger denne tabel når kunden siger husnumre, kvm, antal rum osv. som danske talord. Konverteringen sker INTERNT — Sofia kommenterer aldrig konverteringen højt for kunden.

## Grundprincip — "ones-and-tens"-rækkefølge

Dansk siger enheder FØR titalsangivelsen (omvendt af fx engelsk).

- Engelsk: "seventy-five"  (tens-and-ones)
- Dansk: "femoghalvfjerds" = **fem** + **og** + **halvfjerds** = 5 + 70 = **75**

Formel: `[enhed] + "og" + [titalsangivelse]`

## 0-19 (faste navne)

| Ord | Tal |
|---|---|
| nul | 0 |
| en / et | 1 |
| to | 2 |
| tre | 3 |
| fire | 4 |
| fem | 5 |
| seks | 6 |
| syv | 7 |
| otte | 8 |
| ni | 9 |
| ti | 10 |
| elleve | 11 |
| tolv | 12 |
| tretten | 13 |
| fjorten | 14 |
| femten | 15 |
| seksten | 16 |
| sytten | 17 |
| atten | 18 |
| nitten | 19 |

## 20-90 (titalsangivelser)

| Ord | Tal |
|---|---|
| tyve | 20 |
| tredive | 30 |
| fyrre | 40 |
| halvtreds | 50 |
| tres | 60 |
| halvfjerds | 70 |
| firs | 80 |
| halvfems | 90 |

## 21-99 (sammensatte — eksempler)

Format: `[enhed] + "og" + [tiere]`

### 20'erne
- enogtyve = 21
- toogtyve = 22
- treogtyve = 23
- fireogtyve = 24
- femogtyve = 25
- seksogtyve = 26
- syvogtyve = 27
- otteogtyve = 28
- niogtyve = 29

### 30'erne
- enogtredive = 31
- toogtredive = 32
- treogtredive = 33
- fireogtredive = 34
- femogtredive = 35
- seksogtredive = 36
- syvogtredive = 37
- otteogtredive = 38
- niogtredive = 39

### 40'erne
- enogfyrre = 41
- toogfyrre = 42
- treogfyrre = 43
- fireogfyrre = 44
- femogfyrre = 45
- seksogfyrre = 46
- syvogfyrre = 47
- otteogfyrre = 48
- niogfyrre = 49

### 50'erne
- enoghalvtreds = 51
- tooghalvtreds = 52
- treoghalvtreds = 53
- fireoghalvtreds = 54
- femoghalvtreds = 55
- seksoghalvtreds = 56
- syvoghalvtreds = 57
- otteoghalvtreds = 58
- nioghalvtreds = 59

### 60'erne
- enogtres = 61
- toogtres = 62
- treogtres = 63
- fireogtres = 64
- femogtres = 65
- seksogtres = 66
- syvogtres = 67
- otteogtres = 68
- niogtres = 69

### 70'erne
- enoghalvfjerds = 71
- tooghalvfjerds = 72
- treoghalvfjerds = 73
- fireoghalvfjerds = 74
- femoghalvfjerds = 75
- seksoghalvfjerds = 76
- syvoghalvfjerds = 77
- otteoghalvfjerds = 78
- nioghalvfjerds = 79

### 80'erne
- enogfirs = 81
- toogfirs = 82
- treogfirs = 83
- fireogfirs = 84
- femogfirs = 85
- seksogfirs = 86
- syvogfirs = 87
- otteogfirs = 88
- niogfirs = 89

### 90'erne
- enoghalvfems = 91
- tooghalvfems = 92
- treoghalvfems = 93
- fireoghalvfems = 94
- femoghalvfems = 95
- seksoghalvfems = 96
- syvoghalvfems = 97
- otteoghalvfems = 98
- nioghalvfems = 99

## 100'erne og højere

- hundrede = 100
- tohundrede = 200
- trehundrede = 300
- firehundrede = 400
- femhundrede = 500
- sekshundrede = 600
- syvhundrede = 700
- ottehundrede = 800
- nihundrede = 900
- tusinde = 1000

### Sammensætninger
- ethundrede og femogtyve = 125
- tohundrede og halvtreds = 250
- nihundrede og nioghalvfems = 999

## Brug i samtalen — konvertering uden kommentar

Kunden siger: *"Hovedgaden syvoghalvfjerds"*
→ Sofia internt: "Hovedgaden **77**"

Kunden siger: *"firs kvadratmeter"*
→ Sofia internt: "**80** kvm"

Kunden siger: *"fire og halvfems kvm"* (variant udtale)
→ Sofia internt: "**94** kvm"  (fire + halvfems = 4 + 90 = 94)

Kunden siger: *"tre rum"*
→ Sofia internt: "**3** rum"

## Edge cases

- **"halvanden"** = 1,5 (sjælden i adresser — typisk i mål: 1,5 kvm)
- **Lange tal**: kunden siger fx "ottehundrede og fireogfyrre" → 844
- **Ubestemt form**: "et" og "en" begge = 1 ("et hus" / "en lejlighed")
- **Bogstaver i husnummer**: "syv b" = 7B (Sofia skal kunne kombinere tal + bogstav)

## Reference for hurtig lookup

Hvis Sofia er i tvivl, kan hun spørge naturligt: *"Kan du gentage husnummeret?"* og høre det igen. Hun bør IKLKE spørge "med tal i stedet for bogstaver" — det er robotagtigt og forvirrer kunden.

## Eksempel-flow

```
Kunde: "Hovedgaden femoghalvfjerds."
Sofia (intern): "Hovedgaden 75"
Sofia (højt): (fortsætter naturligt — ingen kommentar om konverteringen)
```
