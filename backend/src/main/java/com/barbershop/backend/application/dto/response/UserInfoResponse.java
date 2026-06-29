package com.barbershop.backend.application.dto.response;

/**
 * DTO de resposta para o endpoint /api/auth/me.
 * Retorna as informações essenciais do usuário autenticado
 * para que o frontend possa gerenciar sessão sem acessar o token JWT diretamente.
 */
public record UserInfoResponse(String id, String email, String role) {}
