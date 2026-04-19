# PlanPlus

**Sistem za automatizaciju planiranja proizvodnje**

PlanPlus je full-stack web aplikacija za upravljanje proizvodnim procesima — od sirovina i sastavnica, preko zaliha, do radnih naloga. Projekat koristi decoupled arhitekturu sa Spring Boot backendom i Angular frontendom.

---

## Sadržaj

- [Arhitektura](#arhitektura)
- [Tehnologije](#tehnologije)
- [Struktura projekta](#struktura-projekta)
- [Modeli podataka](#modeli-podataka)
- [API Endpointi](#api-endpointi)
- [Ključne funkcionalnosti](#ključne-funkcionalnosti)
- [Pokretanje projekta](#pokretanje-projekta)
- [Testiranje](#testiranje)

---

## Arhitektura

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐
│   Angular SPA   │  HTTP   │  Spring Boot    │   JPA   │  PostgreSQL  │
│  localhost:4200  │ ◄─────► │  localhost:8080  │ ◄─────► │   planplus   │
└─────────────────┘  JSON   └─────────────────┘         └──────────────┘
```

Aplikacija prati klasičnu troslojnu arhitekturu: Angular frontend komunicira sa Spring Boot REST API-jem koji upravlja poslovnom logikom i perzistencijom podataka u PostgreSQL bazi.

## Tehnologije

### Backend
- **Java 25** + **Spring Boot 4.0.5**
- **Spring Data JPA** — ORM i pristup bazi
- **Spring Validation** — validacija ulaznih podataka
- **PostgreSQL** — relaciona baza podataka
- **Lombok** — eliminacija boilerplate koda
- **JUnit 5 & Mockito** — unit i integracioni testovi

### Frontend
- **Angular 21** (Angular CLI 21.2.7)
- **TypeScript** (strict mode)
- **RxJS** — reaktivno programiranje
- **Vitest** — unit testiranje
- **SCSS** — stilizovanje komponenti

## Struktura projekta

```
planplus/
├── backend/
│   ├── src/main/java/com/aups/planplus/
│   │   ├── config/          # CORS konfiguracija
│   │   ├── controller/      # REST kontroleri
│   │   ├── dto/             # Data Transfer objekti
│   │   ├── model/           # JPA entiteti
│   │   ├── repository/      # Spring Data repozitorijumi
│   │   └── service/         # Poslovna logika
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/app/
│   │   ├── core/models/     # TypeScript interfejsi
│   │   ├── features/
│   │   │   ├── materials/   # Upravljanje materijalima
│   │   │   ├── products/    # Upravljanje proizvodima
│   │   │   ├── inventory/   # Praćenje zaliha
│   │   │   ├── work-orders/ # Radni nalozi
│   │   │   └── bom/         # Bill of Materials
│   │   ├── app.routes.ts    # Rutiranje
│   │   └── app.config.ts    # App konfiguracija
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Modeli podataka

### Material
Sirovine koje se koriste u proizvodnji. Svaki materijal ima jedinstvenu SKU šifru i jedinicu mere (PCS, KG, M, L).

### Product
Gotovi proizvodi sa sopstvenom SKU šifrom, nazivom i opisom. Proizvod se definiše kroz sastavnicu (BOM).

### BOMItem (Bill of Materials)
Povezuje proizvod sa materijalima koji su potrebni za njegovu izradu. Definiše koliko jedinica svakog materijala je potrebno za jedan proizvod.

### Inventory
Praćenje trenutnog stanja zaliha za svaki materijal u realnom vremenu. Automatski se ažurira prilikom kreiranja radnih naloga.

### WorkOrder
Radni nalog za proizvodnju određene količine proizvoda. Prolazi kroz životni ciklus statusa: `PLANNED` → `IN_PROGRESS` → `COMPLETED` | `CANCELLED`.

## API Endpointi

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/api/materials` | Lista svih materijala |
| `POST` | `/api/materials` | Kreiranje novog materijala |
| `GET` | `/api/products` | Lista svih proizvoda |
| `POST` | `/api/products` | Kreiranje novog proizvoda |
| `GET` | `/api/inventory` | Pregled svih zaliha |
| `POST` | `/api/inventory/add` | Dodavanje zaliha (materialId, quantity) |
| `GET` | `/api/bom/product/{id}` | Sastavnica za proizvod |
| `POST` | `/api/bom` | Dodavanje materijala u sastavnicu |
| `POST` | `/api/work-orders` | Kreiranje radnog naloga |

## Ključne funkcionalnosti

### Upravljanje zalihama
Sistem prati stanje sirovina u realnom vremenu. Zalihe se mogu ručno uvećavati, a automatski se umanjuju prilikom kreiranja radnih naloga na osnovu BOM sastavnice.

### Bill of Materials (BOM)
Svaki proizvod ima definisanu sastavnicu — listu materijala sa potrebnim količinama. Sistem sprečava duplikate (isti materijal ne može biti dodat dvaput za isti proizvod).

### Radni nalozi sa validacijom zaliha
Prilikom kreiranja radnog naloga, sistem automatski:
1. Pronalazi sastavnicu za traženi proizvod
2. Izračunava ukupnu potrebnu količinu svakog materijala
3. Proverava da li su zalihe dovoljne
4. Umanjuje zalihe i kreira nalog sa statusom `PLANNED`

Ako zalihe nisu dovoljne, kreiranje se odbija uz poruku o nedostajućem materijalu.

## Pokretanje projekta

### Preduslovi
- Java 25+
- Node.js 20+ i npm
- PostgreSQL
- Maven (ili koristiti ugrađeni `mvnw`)

### 1. Baza podataka

Kreirajte PostgreSQL bazu:

```sql
CREATE DATABASE planplus;
```

### 2. Backend

```bash
cd backend

# Ažurirajte application.properties sa vašim kredencijalima za bazu
# spring.datasource.url=jdbc:postgresql://localhost:5432/planplus
# spring.datasource.username=your_username
# spring.datasource.password=your_password

./mvnw spring-boot:run
```

Backend će se pokrenuti na `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend će se pokrenuti na `http://localhost:4200`.

## Testiranje

### Backend testovi

```bash
cd backend
./mvnw test
```

Projekat sadrži unit i integracione testove za WorkOrder i Inventory servise koristeći JUnit 5 i Mockito.

### Frontend testovi

```bash
cd frontend
ng test
```

Frontend koristi Vitest za unit testiranje.

---

## CORS konfiguracija

Backend je konfigurisan da prihvata zahteve sa `http://localhost:4200` za sve `/api/**` rute, podržavajući GET, POST, PUT, DELETE i OPTIONS metode.

## Licenca

Ovaj projekat je razvijen u akademske svrhe.
