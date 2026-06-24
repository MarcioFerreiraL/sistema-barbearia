package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.ServiceItemRequest;
import com.barbershop.backend.application.dto.response.ServiceItemResponse;
import com.barbershop.backend.service.ServiceItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Serviços", description = "Endpoints para gerenciamento dos serviços oferecidos pela barbearia")
@RestController
@RequestMapping("/api/services")
public class ServiceItemController {

    private ServiceItemService serviceItemService;

    public ServiceItemController(ServiceItemService serviceItemService) {
        this.serviceItemService = serviceItemService;
    }

    @Operation(summary = "Listar todos os serviços", description = "Retorna uma lista de todos os serviços (cabelo, barba, etc.) cadastrados.")
    @ApiResponse(responseCode = "200", description = "Lista de serviços retornada com sucesso.")
    @GetMapping()
    public ResponseEntity<List<ServiceItemResponse>> getAllServiceItems() {
        return new ResponseEntity<>(serviceItemService.getAllServicesItens(), HttpStatus.OK);
    }

    @Operation(summary = "Buscar serviço por ID", description = "Retorna os detalhes de um serviço específico através do seu ID.")
    @ApiResponse(responseCode = "200", description = "Serviço encontrado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Serviço não encontrado.")
    @GetMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> getServiceItemById(
            @Parameter(description = "ID do serviço a ser buscado", required = true) @PathVariable Long id) {
        ServiceItemResponse serviceItem = serviceItemService.getServiceItemById(id);
        return ResponseEntity.ok(serviceItem);
    }

    @Operation(summary = "Cadastrar serviço", description = "Cria um novo serviço a partir dos dados fornecidos.")
    @ApiResponse(responseCode = "201", description = "Serviço criado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Dados fornecidos inválidos.")
    @PostMapping
    public ResponseEntity<ServiceItemResponse> createServiceItem(@RequestBody ServiceItemRequest request) {
        ServiceItemResponse createdServiceItem = serviceItemService.createServiceItem(request);
        return new ResponseEntity<>(createdServiceItem, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar serviço", description = "Atualiza os dados de um serviço existente identificando-o pelo ID.")
    @ApiResponse(responseCode = "200", description = "Serviço atualizado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Serviço não encontrado.")
    @PatchMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> updateServiceItem(
            @Parameter(description = "ID do serviço a ser atualizado", required = true) @PathVariable Long id,
            @RequestBody ServiceItemRequest request) {
        ServiceItemResponse updatedServiceItem = serviceItemService.updateServiceItem(id, request);
        return new ResponseEntity<>(updatedServiceItem, HttpStatus.OK);
    }

    @Operation(summary = "Excluir serviço", description = "Remove um serviço do sistema a partir do seu ID.")
    @ApiResponse(responseCode = "200", description = "Serviço excluído com sucesso.")
    @ApiResponse(responseCode = "404", description = "Serviço não encontrado.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> deleteServiceItem(
            @Parameter(description = "ID do serviço a ser excluído", required = true) @PathVariable Long id) {
        serviceItemService.deleteServiceItem(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(summary = "Alternar status do serviço", description = "Ativa ou desativa um serviço no sistema a partir do seu ID.")
    @ApiResponse(responseCode = "200", description = "Status do serviço alterado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Serviço não encontrado.")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ServiceItemResponse> toggleServiceItemStatus(
            @Parameter(description = "ID do serviço a ter o status alterado", required = true) @PathVariable Long id) {
        ServiceItemResponse updatedServiceItem = serviceItemService.toggleServiceItemStatus(id);
        return new ResponseEntity<>(updatedServiceItem, HttpStatus.OK);
    }
}
