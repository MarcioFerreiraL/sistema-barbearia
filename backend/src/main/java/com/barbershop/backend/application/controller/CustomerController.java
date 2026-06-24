package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.CustomerRequest;
import com.barbershop.backend.application.dto.response.CustomerResponse;
import com.barbershop.backend.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Clientes", description = "Endpoints para gerenciamento de clientes do sistema")
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(summary = "Listar todos os clientes", description = "Retorna uma lista de todos os clientes cadastrados.")
    @ApiResponse(responseCode = "200", description = "Lista de clientes retornada com sucesso.")
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        return new ResponseEntity<>(customerService.getAllCustomers(), HttpStatus.OK);
    }

    @Operation(summary = "Buscar cliente por ID", description = "Retorna os detalhes de um cliente específico através do seu ID.")
    @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado.")
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(
            @Parameter(description = "ID do cliente a ser buscado", required = true) @PathVariable UUID id) {
        return new ResponseEntity<>(customerService.getCustomerById(id), HttpStatus.OK);
    }

    @Operation(summary = "Cadastrar cliente", description = "Cria um novo cliente a partir dos dados fornecidos.")
    @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Dados fornecidos inválidos.")
    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@RequestBody CustomerRequest customer) {
        CustomerResponse createdCustomer = customerService.createCustomer(customer);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar cliente", description = "Atualiza os dados de um cliente existente identificando-o pelo ID.")
    @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso.")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado.")
    @PatchMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @Parameter(description = "ID do cliente a ser atualizado", required = true) @PathVariable UUID id,
            @RequestBody CustomerRequest customer) {
        CustomerResponse updatedCustomer = customerService.updateCustomer(id, customer);
        return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
    }

    @Operation(summary = "Excluir cliente", description = "Remove um cliente do sistema a partir do seu ID.")
    @ApiResponse(responseCode = "200", description = "Cliente excluído com sucesso.")
    @ApiResponse(responseCode = "404", description = "Cliente não encontrado.")
    @DeleteMapping("/{id}")
    public ResponseEntity<CustomerResponse> deleteCustomer(
            @Parameter(description = "ID do cliente a ser excluído", required = true) @PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
