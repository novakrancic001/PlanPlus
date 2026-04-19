Korak 1: pom.xml — dodavanje dependencies
Dodaj u <dependencies> sekciju (posle postojećih):
xml<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JJWT (0.12.x API — kompatibilan sa Java 25) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Security test starter (za Chat 2 kada budemo testirali autorizaciju) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-test</artifactId>
    <scope>test</scope>
</dependency>

Korak 2: application.properties — dodati JWT i admin bootstrap konfiguraciju
Dodaj u src/main/resources/application.properties:
properties# JWT konfiguracija
# VAZNO: secret mora biti Base64 enkodovan i minimum 256 bita (32 bajta dekodovano).
# Generisi sopstveni: `openssl rand -base64 48`
jwt.secret=Zm9vYmFyYmF6cXV1eGZvb2JhcmJhemF2b2Nhdm9tYWNhdm9jYXZvbWFjYXZvY2F2bw==
jwt.expiration-ms=86400000
# 86400000 ms = 24 sata

# Bootstrap prvog admin naloga (kreira se pri prvom pokretanju ako korisnik ne postoji)
app.admin.username=admin
app.admin.password=admin123
app.admin.first-name=System
app.admin.last-name=Administrator

Korak 3: Role enum
Fajl: src/main/java/com/aups/planplus/auth/model/Role.java
javapackage com.aups.planplus.auth.model;

public enum Role {
    ADMIN("Administrator"),
    PLANNER("Planer"),
    OPERATOR("Operater");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
Zašto dvojno: Java koristi engleske nazive (PLANNER), a UI dobija srpski ("Planer") preko getDisplayName().

Korak 4: User entitet
Fajl: src/main/java/com/aups/planplus/auth/model/User.java
javapackage com.aups.planplus.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Ručno toString - BEZ password polja!
    @Override
    public String toString() {
        return "User{id=" + id + ", username='" + username + "', role=" + role + ", active=" + active + "}";
    }
}
Ključno: @Getter/@Setter umesto @Data, i custom toString() bez password-a.

Korak 5: UserRepository
Fajl: src/main/java/com/aups/planplus/auth/repository/UserRepository.java
javapackage com.aups.planplus.auth.repository;

import com.aups.planplus.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}

Korak 6: DTO-ovi
Fajl: src/main/java/com/aups/planplus/auth/dto/LoginRequest.java
javapackage com.aups.planplus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Korisničko ime je obavezno")
    private String username;

    @NotBlank(message = "Lozinka je obavezna")
    private String password;
}
Fajl: src/main/java/com/aups/planplus/auth/dto/RegisterRequest.java
javapackage com.aups.planplus.auth.dto;

import com.aups.planplus.auth.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Korisničko ime je obavezno")
    @Size(min = 3, max = 50, message = "Korisničko ime mora imati između 3 i 50 karaktera")
    private String username;

    @NotBlank(message = "Lozinka je obavezna")
    @Size(min = 6, message = "Lozinka mora imati najmanje 6 karaktera")
    private String password;

    @NotBlank(message = "Ime je obavezno")
    private String firstName;

    @NotBlank(message = "Prezime je obavezno")
    private String lastName;

    @NotNull(message = "Uloga je obavezna")
    private Role role;
}
Fajl: src/main/java/com/aups/planplus/auth/dto/AuthResponse.java
javapackage com.aups.planplus.auth.dto;

import com.aups.planplus.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String firstName;
    private String lastName;
    private Role role;
    private String roleDisplayName; // srpski naziv za UI
}
Fajl: src/main/java/com/aups/planplus/auth/dto/UserResponse.java
javapackage com.aups.planplus.auth.dto;

import com.aups.planplus.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private Role role;
    private String roleDisplayName;
}

Korak 7: JwtService — generisanje i validacija tokena
Fajl: src/main/java/com/aups/planplus/auth/security/JwtService.java
javapackage com.aups.planplus.auth.security;

import com.aups.planplus.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

Korak 8: CustomUserDetailsService
Fajl: src/main/java/com/aups/planplus/auth/security/CustomUserDetailsService.java
javapackage com.aups.planplus.auth.security;

import com.aups.planplus.auth.model.User;
import com.aups.planplus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Korisnik nije pronađen: " + username));

        if (!user.isActive()) {
            throw new UsernameNotFoundException("Korisnički nalog je deaktiviran");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
Napomena: "ROLE_" + ... prefiks je Spring Security konvencija — bez njega @PreAuthorize("hasRole('ADMIN')") neće raditi u Chat 2.

Korak 9: JwtAuthFilter
Fajl: src/main/java/com/aups/planplus/auth/security/JwtAuthFilter.java
javapackage com.aups.planplus.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            if (jwtService.isTokenValid(token)) {
                String username = jwtService.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token je nevalidan/istekao — samo ne postavljamo auth. 
            // SecurityConfig će vratiti 401 ako endpoint zahteva autentifikaciju.
        }

        filterChain.doFilter(request, response);
    }
}

Korak 10: SecurityConfig — glavna konfiguracija
Fajl: src/main/java/com/aups/planplus/auth/security/SecurityConfig.java
javapackage com.aups.planplus.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // potrebno za @PreAuthorize u Chat 2
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // koristi postojeću CorsConfig konfiguraciju
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Javni endpointi
                        .requestMatchers("/api/auth/login").permitAll()
                        // Svi ostali /api/** zahtevaju autentifikaciju
                        // Chat 2 će dodati fine-grained restrictions po rolama
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
Važno: /api/auth/register NIJE u permitAll() — zahteva autentifikaciju (jer samo admin registruje). Finu proveru da je uloga ADMIN ću staviti u Chat 2 kroz @PreAuthorize, ali za sad ću u Chat 1 staviti i proveru direktno u servisu (kao defanzivni sloj — radiće i bez Chat 2).

Korak 11: AuthService
Fajl: src/main/java/com/aups/planplus/auth/service/AuthService.java
javapackage com.aups.planplus.auth.service;

import com.aups.planplus.auth.dto.AuthResponse;
import com.aups.planplus.auth.dto.LoginRequest;
import com.aups.planplus.auth.dto.RegisterRequest;
import com.aups.planplus.auth.dto.UserResponse;
import com.aups.planplus.auth.exception.UserAlreadyExistsException;
import com.aups.planplus.auth.model.Role;
import com.aups.planplus.auth.model.User;
import com.aups.planplus.auth.repository.UserRepository;
import com.aups.planplus.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Pogrešno korisničko ime ili lozinka");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Pogrešno korisničko ime ili lozinka"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getRole().getDisplayName()
        );
    }

    public UserResponse register(RegisterRequest request) {
        // Defanzivni sloj: samo ADMIN moze da registruje
        // (Chat 2 ce ovo formalizovati kroz @PreAuthorize na kontroleru)
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Morate biti ulogovani");
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Samo administrator može da kreira nove korisnike"
            );
        }

        // Admin ne moze da kreira drugog admina kroz ovaj endpoint
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Kreiranje administratorskog naloga kroz registraciju nije dozvoljeno"
            );
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException(
                    "Korisnik sa korisničkim imenom '" + request.getUsername() + "' već postoji"
            );
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setActive(true);

        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getRole(),
                saved.getRole().getDisplayName()
        );
    }

    public UserResponse getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Korisnik nije pronađen"));

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getRole().getDisplayName()
        );
    }
}

Korak 12: UserAlreadyExistsException
Fajl: src/main/java/com/aups/planplus/auth/exception/UserAlreadyExistsException.java
javapackage com.aups.planplus.auth.exception;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}

Korak 13: AuthController
Fajl: src/main/java/com/aups/planplus/auth/controller/AuthController.java
javapackage com.aups.planplus.auth.controller;

import com.aups.planplus.auth.dto.AuthResponse;
import com.aups.planplus.auth.dto.LoginRequest;
import com.aups.planplus.auth.dto.RegisterRequest;
import com.aups.planplus.auth.dto.UserResponse;
import com.aups.planplus.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}

Korak 14: Ažuriranje CorsConfig-a
Fajl: src/main/java/com/aups/planplus/config/CorsConfig.java
Zameni postojeći sa:
javapackage com.aups.planplus.config;

import lombok.NonNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization") // omoguci frontend-u da cita Authorization header iz response-a
                        .allowCredentials(true);
            }
        };
    }
}

Korak 15: Ažuriranje GlobalExceptionHandler-a
Pošto nemam tačan sadržaj tvog postojećeg handler-a, evo šta treba da dodaš u njega (ne da zameniš ceo fajl):
java// Dodaj ove importove
import com.aups.planplus.auth.exception.UserAlreadyExistsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

// Dodaj ove handlere u postojeci @RestControllerAdvice klasu:

@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", e.getMessage()));
}

@ExceptionHandler(UsernameNotFoundException.class)
public ResponseEntity<Map<String, String>> handleUserNotFound(UsernameNotFoundException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", e.getMessage()));
}

@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", e.getMessage()));
}

@ExceptionHandler(UserAlreadyExistsException.class)
public ResponseEntity<Map<String, String>> handleUserExists(UserAlreadyExistsException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("error", e.getMessage()));
}
Kada budeš radio str_replace na svom postojećem fajlu, samo mi reci kako izgleda pa ću ti dati tačnu sintaksu.

Korak 16: Bootstrap admin naloga
Fajl: src/main/java/com/aups/planplus/auth/bootstrap/AdminBootstrap.java
javapackage com.aups.planplus.auth.bootstrap;

import com.aups.planplus.auth.model.Role;
import com.aups.planplus.auth.model.User;
import com.aups.planplus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.first-name}")
    private String adminFirstName;

    @Value("${app.admin.last-name}")
    private String adminLastName;

    @Override
    public void run(String... args) {
        // Pravi admin nalog samo ako nema nijednog korisnika u bazi
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName(adminFirstName);
            admin.setLastName(adminLastName);
            admin.setRole(Role.ADMIN);
            admin.setActive(true);

            userRepository.save(admin);
            log.info("Inicijalni admin nalog kreiran: username='{}'. PROMENITE LOZINKU ODMAH NAKON PRVE PRIJAVE!", adminUsername);
        }
    }
}

Kako ovo testirati u Postman-u
1. Pokreni aplikaciju — u konzoli bi trebalo da vidiš poruku o kreiranju admin naloga.
2. Login kao admin:
POST http://localhost:8080/api/auth/login
Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}
Očekivani odgovor: JWT token + podaci o korisniku.
3. Registruj planera (koristeći admin token):
POST http://localhost:8080/api/auth/register
Headers: Authorization: Bearer <token-iz-prethodnog-koraka>
Body:
{
  "username": "marko",
  "password": "tajna123",
  "firstName": "Marko",
  "lastName": "Marković",
  "role": "PLANNER"
}
4. Login kao Marko: isti /login sa novim kredencijalima.
5. Proveri da li neautentifikovan pristup vraća 401:
GET http://localhost:8080/api/materials
(bez Authorization header-a) → treba 401
6. Proveri /me:
GET http://localhost:8080/api/auth/me
Headers: Authorization: Bearer <token>
→ vraća podatke o ulogovanom korisniku

Šta da mi kažeš nakon implementacije

Ako nešto ne kompajlira — pošalji tačnu grešku
Sadržaj tvog postojećeg GlobalExceptionHandler-a da ti pošaljem tačan str_replace
Da li Postman testovi iz prethodne sekcije prolaze — ako ne, koji ne prolazi i sa kojom greškom

Kad sve ovo proradi, sledeći chat je Chat 2 — Autorizacija gde ćemo dodati assignedTo polje na WorkOrder, @PreAuthorize na svim kontrolerima, i logiku za praćenje opterećenosti operatera (semafor zeleno/žuto/crveno).