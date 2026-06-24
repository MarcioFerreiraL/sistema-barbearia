package com.barbershop.backend.application.controller;

import com.barbershop.backend.domain.model.BusinessHours;
import com.barbershop.backend.service.BusinessHoursService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Horários de Funcionamento", description = "Endpoints para gerenciamento do horário de funcionamento do estabelecimento")
@RestController
@RequestMapping("/api/business-hours")
public class BusinessHoursController {

    private final BusinessHoursService businessHoursService;

    public BusinessHoursController(BusinessHoursService businessHoursService) {
        this.businessHoursService = businessHoursService;
    }

    @Operation(summary = "Obter horários de funcionamento", description = "Retorna todos os horários de funcionamento cadastrados para cada dia da semana.")
    @ApiResponse(responseCode = "200", description = "Horários de funcionamento retornados com sucesso.")
    @GetMapping
    public ResponseEntity<List<BusinessHours>> getBusinessHours() {
        return ResponseEntity.ok(businessHoursService.getBusinessHours());
    }

    @Operation(summary = "Atualizar horário de funcionamento", description = "Atualiza o horário de funcionamento para um dia da semana específico.")
    @ApiResponse(responseCode = "200", description = "Horário de funcionamento atualizado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Parâmetros de requisição inválidos.")
    @PutMapping("/{dayOfWeek}")
    public ResponseEntity<BusinessHours> updateBusinessHours(
            @Parameter(description = "Dia da semana (1 para Segunda, 7 para Domingo ou correspondente no sistema)", required = true) @PathVariable Integer dayOfWeek,
            @RequestBody BusinessHours request) {
        BusinessHours updated = businessHoursService.updateBusinessHours(dayOfWeek, request);
        return ResponseEntity.ok(updated);
    }
}
