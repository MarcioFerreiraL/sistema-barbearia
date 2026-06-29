package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.AuthenticationRequest;
import com.barbershop.backend.application.dto.response.AuthenticationResponse;
import com.barbershop.backend.application.dto.response.UserInfoResponse;
import com.barbershop.backend.domain.model.User;
import com.barbershop.backend.infraestructure.security.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticação", description = "Endpoints para login e logout de usuários")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthController(AuthenticationManager authenticationManager, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @Operation(summary = "Realizar login", description = "Autentica o usuário no sistema e retorna um token JWT, definindo também o cookie HTTP-only 'token'.")
    @ApiResponse(responseCode = "200", description = "Login realizado com sucesso.")
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas.")
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest authenticationRequest,
            jakarta.servlet.http.HttpServletResponse response) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(authenticationRequest.email(), authenticationRequest.password());
        var auth = authenticationManager.authenticate(usernamePassword);
        var token = tokenService.generateToken((User) auth.getPrincipal());

        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7200)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new AuthenticationResponse(token));
    }

    @Operation(summary = "Obter informações do usuário autenticado", description = "Retorna id, e-mail e role do usuário a partir do cookie de sessão.")
    @ApiResponse(responseCode = "200", description = "Informações retornadas com sucesso.")
    @ApiResponse(responseCode = "401", description = "Usuário não autenticado.")
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            String role = user.getRole().name().replace("ROLE_", "");
            if (role.equals("CUSTOMER")) role = "CLIENT";
            return ResponseEntity.ok(new UserInfoResponse(
                    user.getId().toString(),
                    user.getEmail(),
                    role
            ));
        }
        return ResponseEntity.status(401).build();
    }

    @Operation(summary = "Realizar logout", description = "Remove o token de autenticação limpando o cookie 'token'.")
    @ApiResponse(responseCode = "200", description = "Logout realizado com sucesso.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(jakarta.servlet.http.HttpServletResponse response) {
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }
}
