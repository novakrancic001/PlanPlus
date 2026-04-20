Sumiranje — PlanPlus projekat
Kontekst
PlanPlus — informacioni sistem za planiranje proizvodnje (MRP/ERP Lite), projektni zadatak AUPS 2025/2026.
Stack:

Backend: Spring Boot 4.0.5, Java 25, PostgreSQL, JPA/Hibernate, Lombok
Frontend: Angular (u zasebnom folderu, još neizmenjen)
Baza: planplus_db

Struktura:
PlanPlus - full/
├── backend/          (Spring Boot - Maven modul)
├── frontend/         (Angular)
├── docs/plans/       (plan fajlovi po chat-u)
├── CLAUDE.md
└── .gitignore
Uloge:

ADMIN — jedini može registrovati nove korisnike; ne bavi se domenskom logikom
PLANNER — CRUD nad svim domenskim entitetima, dodeljuje radne naloge operaterima, prati opterećenost (semafor)
OPERATOR — vidi samo svoje dodeljene radne naloge + sastavnicu proizvoda

Konvencije koda:

Java kod (klase, metode, enum vrednosti): engleski
Vidljive vrednosti (UI labele, poruke grešaka): srpski
@Data OK za većinu entiteta, ali NE za User — @Getter/@Setter + custom toString() bez password polja

Plan podele na chat-ove

✅ Chat 1 — Backend autentifikacija (JWT + Spring Security)
⏭️ Chat 2 — Backend autorizacija (@PreAuthorize, assignedTo na WorkOrder, logika opterećenosti)
⏸️ Chat 3 — Backend paginacija, sortiranje, pretraga
⏸️ Chat 4 — Frontend autentifikacija (Angular)
⏸️ Chat 5 — Frontend paginacija i tabele


Šta je završeno u Chat-u 1
Faza 1: Dependencies

spring-boot-starter-security, jjwt-api/impl/jackson 0.12.6, spring-security-test
application.yaml + application-local.yaml (profil=local, JWT secret, admin credentials)

Faza 2: Model + Repository

auth/model/Role.java — enum (ADMIN, PLANNER, OPERATOR) sa srpskim displayName
auth/model/User.java — JPA entitet (tabela users), @Getter/@Setter, custom toString() bez password, @PrePersist za createdAt
auth/repository/UserRepository.java — findByUsername, existsByUsername

Faza 3: DTO-ovi

auth/dto/LoginRequest.java — validacija @NotBlank
auth/dto/RegisterRequest.java — @NotBlank, @Size, @NotNull sa srpskim porukama
auth/dto/AuthResponse.java — ručni 2-arg konstruktor, tokenType = "Bearer" kao field default
auth/dto/UserResponse.java — bez password polja, statički from(User) factory

Faza 4: Security infrastruktura

auth/exception/UserAlreadyExistsException.java
auth/security/JwtService.java — JJWT 0.12.6 API (verifyWith, parseSignedClaims)
auth/security/CustomUserDetailsService.java — ROLE_ prefiks obavezan
auth/security/JwtAuthFilter.java — OncePerRequestFilter, catch ne baca exception
auth/security/SecurityConfig.java — @EnableMethodSecurity, stateless, BCrypt
config/CorsConfig.java — prepravljen na CorsConfigurationSource bean

Faza 5: Service + Controller

auth/service/AuthService.java — login, register (sa defensive ADMIN check), getCurrentUser
auth/controller/AuthController.java — /api/auth/login, /api/auth/register (201 Created), /api/auth/me

Faza 6: Bootstrap + izmene

auth/bootstrap/AdminBootstrap.java — kreira admin-a ako count() == 0
exception/GlobalExceptionHandler.java — prepravljen na @RestControllerAdvice, mapira:

MethodArgumentNotValidException → 400 sa mapom polja
IllegalArgumentException → 400
BadCredentialsException + UsernameNotFoundException → 401 (ista poruka, security hygiene)
AccessDeniedException → 403
UserAlreadyExistsException → 409
RuntimeException → 400 (fallback)



Testovi — Postman Collection "PlanPlus Auth"
31/32 assertion-a prolazi. Jedini "fail" je Test 7 koji je očekivano ponašanje u Chat-u 1 — biće rešen u Chat-u 2.
Poznato ponašanje (ne bug):

Pri praznom password-u vraća se @Size poruka umesto @NotBlank — jer errors mapa prepisuje istu ključ-vrednost. Test 12 koristi oneOf(...) assertion. Može se kasnije rešiti kroz Map<String, List<String>> u GlobalExceptionHandler-u (Chat 4 ako treba).