# PlanPlus - Backend (Production Planning API)

Ovo je jezgro sistema za automatizaciju planiranja proizvodnje. API je izgrađen korišćenjem **Spring Boot** frameworka i služi kao centralni mozak za upravljanje resursima i radnim nalozima.

## Tehnologije
* **Java 17/21**
* **Spring Boot 3.x** (Data JPA, Web, Validation)
* **PostgreSQL** (Baza podataka)
* **Lombok** (Smanjenje boilerplate koda)
* **JUnit 5 & Mockito** (Unit i Integration testiranje)

## Ključni Moduli
* **Inventory Management**: Praćenje stanja sirovina (`Material`) u realnom vremenu uz automatsko umanjenje/uvećanje zaliha.
* **BOM (Bill of Materials)**: Definisanje sastavnica za gotove proizvode.
* **Work Order Engine**: Upravljanje životnim ciklusom radnih naloga (`PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).

## 🛠️ Podešavanje i Pokretanje
1. **Baza podataka**: Kreirajte PostgreSQL bazu pod nazivom `planplus`.
2. **Konfiguracija**: Ažurirajte `src/main/resources/application.properties` sa vašim kredencijalima za bazu.
3. **Pokretanje**:
   ```bash
   ./mvnw spring-boot:run