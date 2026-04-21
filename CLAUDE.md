# PlanPlus — kontekst za Claude Code

## Projekat
PlanPlus je informacioni sistem za planiranje proizvodnje (MRP/ERP Lite).
Projektni zadatak na predmetu AUPS 2025/2026, Fakultet tehničkih nauka.

## Arhitektura
- **Backend**: Spring Boot 4.0.5, Java 25, PostgreSQL, JPA/Hibernate, Lombok
- **Frontend**: Angular (u direktorijumu `frontend/`)
- **Backend pokretanje**: `cd backend && ./mvnw spring-boot:run`
- **Backend URL**: http://localhost:8080
- **Frontend URL**: http://localhost:4200
- **Baza**: PostgreSQL, baza `planplus`, kredencijali u `application.properties`

## Struktura backend paketa
- `com.aups.planplus.model` — JPA entiteti (Material, Product, WorkOrder, BOMItem, Inventory)
- `com.aups.planplus.repository` — Spring Data JPA repozitorijumi
- `com.aups.planplus.service` — biznis logika
- `com.aups.planplus.controller` — REST kontroleri
- `com.aups.planplus.dto` — request/response DTO-ovi
- `com.aups.planplus.config` — Spring konfiguracija (CORS itd.)
- `com.aups.planplus.auth` — autentifikacija i autorizacija (User, Role JWT, SecurityConfig)
- `com.aups.planplus.workload` — semafor opterećenosti operatera

## Domenski model
- **Material** — sirovine sa SKU, imenom, jedinicom mere
- **Product** — gotovi proizvodi
- **Inventory** — trenutno stanje sirovina
- **BOMItem** — sastavnica: koliko materijala treba za proizvod
- **WorkOrder** — radni nalog sa statusima PLANNED, IN_PROGRESS, COMPLETED, CANCELLED

## Uloge (u izradi — Chat 4)
- **ADMIN** — jedini može registrovati nove korisnike
- **PLANNER** — CRUD nad svim domenskim entitetima, dodeljuje radne naloge operaterima
- **OPERATOR** — vidi samo radne naloge koji su mu dodeljeni

## Konvencije koda
- Java klase, metode, polja → engleski (`User`, `Role`, `PLANNER`)
- Vidljive vrednosti (UI labele, poruke grešaka) → srpski ("Planer", "Pogrešna lozinka")
- `@Data` OK za većinu entiteta
- `@Data` NE za User entitet — koristiti `@Getter`/`@Setter` + custom `toString()` bez password polja
- DTO-ovi koriste `@Data` + Jakarta Validation anotacije
- Poruke grešaka u exception handleru → srpski

## Radni proces — planirani chat-ovi
1. **Chat 1** (zavrseno): Backend autentifikacija — Spring Security + JWT, User entitet, login/register endpointi
2. **Chat 2** (zavrseno): Backend autorizacija — @PreAuthorize po rolama, dodela operatera na WorkOrder, logika opterećenosti
3. **Chat 3** (zavrseno): Backend paginacija, sortiranje, pretraga — Pageable na svim list endpointima
4. **Chat 4** (na redu): Frontend autentifikacija — Angular login/register/logout, AuthInterceptor, AuthGuard
5. **Chat 5**: Frontend paginacija i tabele — MatTable, MatPaginator, MatSort

## Komande koje često koristim
- Backend run: `cd backend && ./mvnw spring-boot:run`
- Backend testovi: `cd backend && ./mvnw test`
- Backend clean build: `cd backend && ./mvnw clean install`
- Frontend run: `cd frontend && npm start`
- Frontend build: `cd frontend && npm run build`

## Šta trenutno radim
Krećem Chat 4 — frontend autentifikaciju u Angular-u.
Backend auth/autorizacija (Chat 1, 2) i paginacija (Chat 3) su završeni
i testirani kroz Postman. Sada treba da implementiram login/register
stranice, AuthInterceptor za JWT, AuthGuard za zaštitu ruta i logout.
Plan implementacije se vodi u chat-u na claude.ai.

Detaljni rezimei završenih faza: docs/plans/chat{1,2,3}-summary.md

## Šta Claude NE treba da radi
- Ne menjaj `backend/` fajlove bez eksplicitne potvrde (backend je završen kroz Chat 1-3)
- Ne refaktorisi postojeće feature komponente (materials, products, work-orders, inventory, bom) bez dogovora — Chat 4 dodaje auth, ne menja postojeće stranice
- Ne dodaji nove npm dependencies bez da prvo pitaš (posebno ne Angular Material — o tome smo već razgovarali)
- Ne refaktorisi postojeće entitete (Material, Product, WorkOrder...) bez eksplicitne potvrde
- Ne dodaji nove Maven dependencies bez da prvo pitaš
- Ne menjaj `application.properties` kredencijale za bazu