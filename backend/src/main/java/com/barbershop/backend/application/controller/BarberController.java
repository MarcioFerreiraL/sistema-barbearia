package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.BarberRequest;
import com.barbershop.backend.application.dto.response.BarberResponse;
import com.barbershop.backend.service.BarberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Barbeiros", description = "Endpoints para gerenciamento de barbeiros do sistema")
@RestController
@RequestMapping("/api/barbers")
public class BarberController {
    private final BarberService barberService;
    public BarberController(BarberService barberService) {
        this.barberService = barberService;
    }

    @Operation(summary = "Listar todos os barbeiros", description = "Retorna uma lista de todos os barbeiros cadastrados.")
    @ApiResponse(responseCode = "200", description = "Lista de barbeiros retornada com sucesso.")
    @GetMapping
    public ResponseEntity<List<BarberResponse>> getAllBarbers() {
        return new ResponseEntity<>(barberService.getAllBarbers(), HttpStatus.OK);
    }

    @Operation(summary = "Buscar barbeiro por ID", description = "Retorna os detalhes de um barbeiro específico através do seu ID.")
    @ApiResponse(responseCode = "200", description = "Barbeiro encontrado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Barbeiro não encontrado.")
    @GetMapping("/{id}")
    public ResponseEntity<BarberResponse> getBarberByEmail(
            @Parameter(description = "ID do barbeiro a ser buscado", required = true) @PathVariable UUID id) {
        return new ResponseEntity<>(barberService.getBarberById(id), HttpStatus.OK);
    }

    @Operation(summary = "Cadastrar barbeiro", description = "Cria um novo barbeiro a partir dos dados fornecidos.")
    @ApiResponse(responseCode = "201", description = "Barbeiro criado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Dados fornecidos inválidos.")
    @PostMapping
    public ResponseEntity<BarberResponse> createBarber(@RequestBody BarberRequest barber) {
        BarberResponse createdCustomer = barberService.createBarber(barber);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar barbeiro", description = "Atualiza os dados de um barbeiro existente identificando-o pelo ID.")
    @ApiResponse(responseCode = "200", description = "Barbeiro atualizado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Barbeiro não encontrado.")
    @PatchMapping("/{id}")
    public ResponseEntity<BarberResponse> updateBarber(
            @Parameter(description = "ID do barbeiro a ser atualizado", required = true) @PathVariable UUID id,
            @RequestBody BarberRequest barber) {
        BarberResponse updatedBarber = barberService.updateBarber(id, barber);
        return new ResponseEntity<>(updatedBarber, HttpStatus.OK);
    }

    @Operation(summary = "Excluir barbeiro", description = "Remove um barbeiro do sistema a partir do seu ID.")
    @ApiResponse(responseCode = "200", description = "Barbeiro excluído com sucesso.")
    @ApiResponse(responseCode = "404", description = "Barbeiro não encontrado.")
    @DeleteMapping("/{id}")
    public ResponseEntity<BarberResponse> deleteBarber(
            @Parameter(description = "ID do barbeiro a ser excluído", required = true) @PathVariable UUID id) {
        barberService.deleteBarber(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(summary = "Alternar status do barbeiro", description = "Ativa ou desativa um barbeiro no sistema a partir do seu ID.")
    @ApiResponse(responseCode = "200", description = "Status do barbeiro alterado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Barbeiro não encontrado.")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<BarberResponse> toggleBarberStatus(
            @Parameter(description = "ID do barbeiro a ter o status alterado", required = true) @PathVariable UUID id) {
        BarberResponse updatedBarber = barberService.toggleBarberStatus(id);
        return new ResponseEntity<>(updatedBarber, HttpStatus.OK);
    }
}
