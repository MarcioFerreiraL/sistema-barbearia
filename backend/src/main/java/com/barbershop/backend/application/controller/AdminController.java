package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.AdminRequest;
import com.barbershop.backend.application.dto.response.AdminResponse;
import com.barbershop.backend.domain.model.Admin;
import com.barbershop.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Administradores", description = "Endpoints para gerenciamento de administradores do sistema")
@RestController
@RequestMapping("/api/admins")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @Operation(summary = "Listar todos os administradores", description = "Retorna uma lista com todos os administradores cadastrados.")
    @ApiResponse(responseCode = "200", description = "Lista de administradores retornada com sucesso.")
    @GetMapping
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        return new ResponseEntity<>(adminService.getAllAdmins(), HttpStatus.OK);
    }

    @Operation(summary = "Buscar administrador por ID", description = "Retorna os detalhes de um administrador específico através do seu ID.")
    @ApiResponse(responseCode = "200", description = "Administrador encontrado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Administrador não encontrado.")
    @GetMapping("/{id}")
    public ResponseEntity<AdminResponse> getAdminById(
            @Parameter(description = "ID do administrador a ser buscado", required = true) @PathVariable UUID id) {
        return new ResponseEntity<>(adminService.getAdminById(id), HttpStatus.OK);
    }

    @Operation(summary = "Cadastrar administrador", description = "Cria um novo administrador a partir dos dados fornecidos.")
    @ApiResponse(responseCode = "201", description = "Administrador criado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Dados fornecidos inválidos.")
    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(@RequestBody AdminRequest admin) {
        AdminResponse adminCreated = adminService.createAdmin(admin);
        return new ResponseEntity<>(adminCreated, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar administrador", description = "Atualiza os dados de um administrador existente identificando-o pelo ID.")
    @ApiResponse(responseCode = "200", description = "Administrador atualizado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Administrador não encontrado.")
    @PatchMapping("/{id}")
    public ResponseEntity<AdminResponse> updateAdmin(
            @Parameter(description = "ID do administrador a ser atualizado", required = true) @PathVariable UUID id,
            @RequestBody AdminRequest admin) {
        AdminResponse updatedAdmin = adminService.updateAdmin(id, admin);
        return new ResponseEntity<>(updatedAdmin, HttpStatus.OK);
    }

    @Operation(summary = "Excluir administrador", description = "Remove um administrador do sistema a partir do seu ID.")
    @ApiResponse(responseCode = "200", description = "Administrador excluído com sucesso.")
    @ApiResponse(responseCode = "404", description = "Administrador não encontrado.")
    @DeleteMapping("/{id}")
    public ResponseEntity<AdminResponse> deleteCustomer(
            @Parameter(description = "ID do administrador a ser excluído", required = true) @PathVariable UUID id) {
        adminService.deleteAdmin(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
