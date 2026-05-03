# PlanPlus — TODO (Chat 6)

## 1. Workload stranica

**Šta:** Stranica `/workload` dostupna samo PLANNER-u koja prikazuje listu svih operatera sa semaforom opterećenosti.

**Backend:** Endpoint već postoji — `GET /api/operators/workload` → `List<OperatorWorkloadDTO>` (id, username, firstName, lastName, activeOrders, loadStatus, displayColor).

**Frontend potrebno:**
- Nova ruta `/workload` sa `roleGuard(['PLANNER'])`
- Nova komponenta `features/work-orders/pages/workload/workload.ts`
- Tabela: ime, prezime, korisničko ime, aktivni nalozi, semafor (zelena 0–2, narandžasta 3–5, crvena 6+)
- Link u sidebar-u (samo PLANNER, ispod "Radni nalozi")

---

## 2. Validacione poruke po poljima

**Šta:** Backend pri `MethodArgumentNotValidException` vraća mapu `{ "fieldName": "poruka" }`. Frontend trenutno ignoriše ovu mapu i prikazuje generičku grešku.

**Primjer response-a:**
```json
{ "username": "Korisničko ime je obavezno", "password": "Lozinka mora imati između 6 i 100 karaktera" }
```

**Gdje se pojavljuje:** Register forma (najbitnije), login forma (manje relevantno).

**Frontend potrebno:**
- U `register.ts` — parsirati `err.error` kao `Record<string, string>` i prikazati greške ispod odgovarajućih polja
- Opciono: isti pattern za ostale forme (materijali, proizvodi, itd.)

---

## 3. 403 feedback

**Šta:** Kada korisnik pokuša pristupiti ruti za koju nema ulogu, `roleGuard` ga tiho preusmjerava bez poruke.

**Frontend potrebno:**
- Kratka toast/banner poruka "Nemate dozvolu za ovu stranicu" prije redirecta
- Ili posebna `/forbidden` stranica sa porukom i linkom nazad
