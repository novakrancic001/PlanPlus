# Chat 4 + 5 — Frontend autentifikacija, paginacija i bugfixovi

## Šta je završeno

---

### Chat 4 — Frontend autentifikacija

**Faza 1: Core auth sloj**
- `core/models/user.model.ts` — `User` interfejs, `Role` tip
- `core/models/auth.model.ts` — `LoginRequest`, `AuthResponse`, `RegisterRequest`
- `core/auth/auth.service.ts` — signals (`currentUser`, `isAuthenticated`, `userRole`), `login()`, `logout()`, `register()`, `loadCurrentUser()`, `getToken()`, `getDefaultRoute()`; pri refreshu stranice automatski reload korisnika iz `/api/auth/me`
- `core/auth/auth.interceptor.ts` — dodaje `Authorization: Bearer <token>` na sve zahtjeve osim `/api/auth/login`; 401 → automatski logout
- `app.config.ts` — `withInterceptors([authInterceptor])`

**Faza 2: Guard + Layout**
- `core/auth/auth.guard.ts` — funkcionalni guard, provjera tokena sinhrono (`getToken()`)
- `shared/components/main-layout/` — sidebar sa kondicionalni nav linkovima po ulozi, ime/uloga korisnika u footeru, logout dugme
- `app.routes.ts` — sve zaštićene rute kao child rute `MainLayoutComponent`-a sa `canActivate: [authGuard]`; `app.html` sveden na `<router-outlet />`

**Faza 3: RoleGuard + Register**
- `core/auth/role.guard.ts` — factory `roleGuard(roles[])`, čeka async signal ako korisnik još nije učitan (`toObservable` + filter), redirect na default rutu pri pogrešnoj ulozi
- `features/auth/pages/register/` — forma za registraciju (samo ADMIN), polja: ime, prezime, korisničko ime, lozinka, uloga (PLANNER/OPERATOR); uspješna poruka + reset forme
- Login redirect po ulozi: ADMIN → `/register`, ostali → `/work-orders`
- Nav linkovi: ADMIN vidi "Registracija korisnika", PLANNER vidi sve, OPERATOR samo "Radni nalozi"

---

### Chat 5 — Frontend paginacija, sortiranje, pretraga

**Shared infrastruktura**
- `core/models/page.model.ts` — `Page<T>` i `PageRequest` interfejsi
- `shared/components/paginator/` — reusable komponenta: prev/next, numerisane stranice (±2 od trenutne), "N po strani" select, info "X–Y od Z"

**Ažurirani servisi** (svi vraćaju `Page<T>`, `getAllForDropdown()` za select elemente)
- `MaterialService`, `ProductService`, `InventoryService` — `getAll(PageRequest)`, `getAllForDropdown()` (size=1000)
- `WorkOrderService` — `getAll(WorkOrderPageRequest)` sa dodatnim `status` filtrom, `assign(orderId, operatorId)`
- `WorkloadService` — `GET /api/operators/workload` za listu operatera

**Ažurirane feature stranice** (sve imaju search bar, sort headers ↕/↑/↓, paginaciju)
- `material-list` — sort po SKU/naziv, inline edit zadržan
- `product-list` — sort po SKU/naziv, inline edit zadržan
- `inventory-list` — sort po materijalu/SKU/stanju
- `work-order-list` — sort po svim kolonama, filter po statusu, inline assign (PLANNER bira operatera direktno u redu tabele)

**Izmijenjeni modeli**
- `work-order.model.ts` — usklađen sa backend `WorkOrderResponse` (flat polja: `productId`, `productName`, umjesto nested `product: Product`); dodat `assignedTo?: User | null`
- `workload.model.ts` — novi `OperatorWorkload`, `LoadStatus`

---

### Advance logika — OPERATOR završava nalog

**Backend izmjene**
- `WorkOrderController.advanceStatus` — `@PreAuthorize` promijenjen na `hasAnyRole('PLANNER','OPERATOR')`, prima `Authentication`
- `WorkOrderService.advanceStatus(id, auth)`:
  - OPERATOR: smije samo `IN_PROGRESS → COMPLETED`, samo na svom nalogu; baca 403 za tuđi nalog
  - PLANNER: stara logika `PLANNED → IN_PROGRESS → COMPLETED`

**Frontend izmjene**
- `canAdvance()` — PLANNER: PLANNED/IN_PROGRESS; OPERATOR: samo IN_PROGRESS + dodijeljen njemu
- `advanceLabel()` — PLANNER: "Pokreni"/"Završi", OPERATOR: uvijek "Završi"
- `canCancel()` — eksplicitno samo PLANNER
- Template — OPERATOR dobija kolonu "Akcije" sa "Završi" dugmetom

---

### Bugfixovi

| Bug | Uzrok | Fix |
|-----|-------|-----|
| PATCH advance/cancel blokiran CORS-om | `CorsConfig` nije imao `PATCH` u `allowedMethods` | Dodato `PATCH` |
| Radni nalozi prazni (nema podataka) | Frontend model koristio `product: Product` (nested), backend vraća flat `productId/productName` | Model usklađen |
| Paginacija size select ne radi | `[value]="size"` na `<select>` ne selektuje opciju u Angularu | Zamijenjeno sa `[selected]="s === size"` na svakom `<option>` |

---

## Arhitekturne odluke

- `authGuard` koristi `getToken()` (sinhrono) da izbjegne race condition pri prvom učitavanju
- `roleGuard` koristi `toObservable(auth.currentUser)` da sačeka async `/api/auth/me` response
- Svi servisi koriste `getAllForDropdown()` (size=1000) za select elemente u formama — jednostavno i dovoljno za akademski projekat
- `WorkOrder.product` ne postoji u frontend modelu jer backend ne vraća nested Product u `WorkOrderResponse`; ako bude potrebno, dodati `productSku`/`productUnit` u `WorkOrderResponse.java`

---

## Trenutno stanje projekta

Svi planirani chat-ovi (1–5) su završeni:

| Chat | Tema | Status |
|------|------|--------|
| Chat 1 | Backend JWT + Spring Security | ✅ |
| Chat 2 | Backend autorizacija + assign + workload | ✅ |
| Chat 3 | Backend paginacija, sortiranje, pretraga | ✅ |
| Chat 4 | Frontend autentifikacija | ✅ |
| Chat 5 | Frontend paginacija + tabele | ✅ |

## Što nije implementirano (potencijalni Chat 6)

- **Workload stranica** — backend ima `GET /api/operators/workload` (PLANNER), frontend nema stranicu koja prikazuje semafore opterećenosti operatera
- **Product detail / BOM** — postoji stranica, ali nikad testirana uz autentifikaciju; BOM forma koristi `getAllForDropdown()` ✓
- **Validacija formi** — minimalna; frontend ne prikazuje server-side greške po poljima (validacione poruke iz `MethodArgumentNotValidException`)
- **403 stranica** — pri pogrešnoj ulozi korisnik je tiho preusmjeren; nema feedback-a
