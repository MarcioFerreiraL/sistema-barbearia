package com.barbershop.backend.infraestructure.config;

import com.barbershop.backend.infraestructure.security.SecurityFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customers").permitAll()
                        
                        // Admins
                        .requestMatchers(HttpMethod.POST, "/api/admins").permitAll() // Validado programaticamente no Service
                        .requestMatchers("/api/admins/**").hasRole("ADMIN")
                        
                        // Barbeiros
                        .requestMatchers(HttpMethod.POST, "/api/barbers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/barbers/**").hasAnyRole("ADMIN", "BARBER")
                        .requestMatchers(HttpMethod.DELETE, "/api/barbers/**").hasRole("ADMIN")
                        
                        // Serviços
                        .requestMatchers(HttpMethod.POST, "/api/services").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/services/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/services/**").hasRole("ADMIN")
                        
                        // Funcionamento
                        .requestMatchers(HttpMethod.PUT, "/api/business-hours/**").hasRole("ADMIN")
                        
                        // Clientes (Listagem geral restrita, detalhe individual e manipulação exigem autenticação e validação no Service)
                        .requestMatchers(HttpMethod.GET, "/api/customers").hasAnyRole("ADMIN", "BARBER")
                        
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}