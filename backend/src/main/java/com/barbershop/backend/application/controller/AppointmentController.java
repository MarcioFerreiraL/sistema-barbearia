package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.AppointmentRequest;
import com.barbershop.backend.application.dto.response.AppointmentResponse;
import com.barbershop.backend.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Agendamentos", description = "Endpoints para gerenciamento de agendamentos e horários marcados")
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @Operation(summary = "Listar todos os agendamentos", description = "Retorna uma lista contendo todos os agendamentos realizados.")
    @ApiResponse(responseCode = "200", description = "Lista de agendamentos retornada com sucesso.")
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @Operation(summary = "Buscar agendamento por ID", description = "Retorna os detalhes de um agendamento específico através do seu ID.")
    @ApiResponse(responseCode = "200", description = "Agendamento encontrado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Agendamento não encontrado.")
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @Parameter(description = "ID do agendamento a ser buscado", required = true) @PathVariable UUID id) {
        AppointmentResponse appointmentResponse = appointmentService.convertToResponseById(id);
        return ResponseEntity.ok(appointmentResponse);
    }

    @Operation(summary = "Criar agendamento", description = "Cria um novo agendamento a partir dos dados de cliente, barbeiro, serviço e horário.")
    @ApiResponse(responseCode = "201", description = "Agendamento criado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Dados fornecidos inválidos ou horário indisponível.")
    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Atualizar agendamento", description = "Atualiza os dados de um agendamento existente.")
    @ApiResponse(responseCode = "200", description = "Agendamento atualizado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos.")
    @ApiResponse(responseCode = "404", description = "Agendamento não encontrado.")
    @PatchMapping("/{id}/update")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @Parameter(description = "ID do agendamento a ser atualizado", required = true) @PathVariable UUID id,
            @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.updateAppointment(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @Operation(summary = "Cancelar agendamento", description = "Cancela um agendamento existente identificando-o pelo ID.")
    @ApiResponse(responseCode = "204", description = "Agendamento cancelado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Agendamento não encontrado.")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(
            @Parameter(description = "ID do agendamento a ser cancelado", required = true) @PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Concluir agendamento", description = "Marca um agendamento como concluído identificando-o pelo ID.")
    @ApiResponse(responseCode = "204", description = "Agendamento concluído com sucesso.")
    @ApiResponse(responseCode = "404", description = "Agendamento não encontrado.")
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Void> completeAppointment(
            @Parameter(description = "ID do agendamento a ser concluído", required = true) @PathVariable UUID id) {
        appointmentService.completeAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
