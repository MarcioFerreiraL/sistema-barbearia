package com.barbershop.backend.infraestructure.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.barbershop.backend.domain.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

@Service
public class TokenService {

    @Value("{api.security.token.secret}")
    private String tokenSecret;

    public String generateToken(User user) {

        try {
            Algorithm algorithm = Algorithm.HMAC256(tokenSecret);
            return JWT.create()
                    .withIssuer("barbershop-api") // Quem emitiu
                    .withSubject(user.getEmail()) // Quem é o dono do token
                    .withExpiresAt(genExpirationDate()) // Expira em 2 horas
                    .sign(algorithm);
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Erro ao gerar o token JWT", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(tokenSecret);
            return JWT.require(algorithm)
                    .withIssuer("barbershop-api")
                    .build()
                    .verify(tokenSecret)
                    .getSubject();
        } catch (JWTVerificationException exception) {
           return "";
        }
    }

    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }

}
