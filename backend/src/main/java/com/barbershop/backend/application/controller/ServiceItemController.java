package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.ServiceItemRequest;
import com.barbershop.backend.application.dto.response.ServiceItemResponse;
import com.barbershop.backend.service.ServiceItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceItemController {

    private ServiceItemService serviceItemService;

    public ServiceItemController(ServiceItemService serviceItemService) {
        this.serviceItemService = serviceItemService;
    }

    @GetMapping()
    public ResponseEntity<List<ServiceItemResponse>> getAllServiceItems() {
        return new ResponseEntity<>(serviceItemService.getAllServicesItens(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> getServiceItemById(@PathVariable Long id) {
        ServiceItemResponse serviceItem = serviceItemService.getServiceItemById(id);
        return ResponseEntity.ok(serviceItem);
    }
    @PostMapping
    public ResponseEntity<ServiceItemResponse> createServiceItem(@RequestBody ServiceItemRequest request) {
        ServiceItemResponse createdServiceItem = serviceItemService.createServiceItem(request);
        return new ResponseEntity<>(createdServiceItem, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> updateServiceItem(@RequestBody ServiceItemRequest request) {
        ServiceItemResponse updatedServiceItem = serviceItemService.updateServiceItem(request);
        return new ResponseEntity<>(updatedServiceItem, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ServiceItemResponse> deleteServiceItem(@PathVariable Long id) {
        serviceItemService.deleteServiceItem(id);

        return ResponseEntity.noContent().build();
    }
}
