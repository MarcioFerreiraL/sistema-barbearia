package com.barbershop.backend.service.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message); // Repassa a mensagem para a classe mãe do Java
    }
}