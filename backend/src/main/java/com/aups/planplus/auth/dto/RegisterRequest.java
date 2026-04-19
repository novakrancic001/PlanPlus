package com.aups.planplus.auth.dto;

import com.aups.planplus.auth.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Korisničko ime je obavezno")
    @Size(min = 3, max = 50, message = "Korisničko ime mora imati između 3 i 50 karaktera")
    private String username;

    @NotBlank(message = "Lozinka je obavezna")
    @Size(min = 6, max = 100, message = "Lozinka mora imati između 6 i 100 karaktera")
    private String password;

    @NotBlank(message = "Ime je obavezno")
    @Size(max = 50, message = "Ime može imati najviše 50 karaktera")
    private String firstName;

    @NotBlank(message = "Prezime je obavezno")
    @Size(max = 50, message = "Prezime može imati najviše 50 karaktera")
    private String lastName;

    @NotNull(message = "Uloga je obavezna")
    private Role role;
}