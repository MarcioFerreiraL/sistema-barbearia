package com.barbershop.backend.application.controller;

import com.barbershop.backend.domain.model.ServiceItem;
import com.barbershop.backend.service.ServiceItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
public class ServiceItemController {

    private ServiceItemService serviceItemService;

    public ServiceItemController(ServiceItemService serviceItemService) {
        this.serviceItemService = serviceItemService;
    }

    @GetMapping()
    public ResponseEntity<List<ServiceItem>> getAllServiceItems() {
        return new ResponseEntity<>(serviceItemService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceItem> getServiceItemById(@PathVariable Long id) {
        Optional<ServiceItem> serviceItem = serviceItemService.getServiceItemById(id);
        return serviceItem.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<ServiceItem> createServiceItem(@RequestBody ServiceItem serviceItem) {
        ServiceItem createdServiceItem = serviceItemService.createServiceItem(serviceItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceItem> updateServiceItem(@RequestBody ServiceItem serviceItem) {
        if (serviceItemService.verifyServiceItem(serviceItem)) {
            ServiceItem updatedServiceItem = serviceItemService.updateServiceItem(serviceItem);
            return ResponseEntity.status(HttpStatus.OK).body(updatedServiceItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/services/{id}")
    public ResponseEntity<ServiceItem> deleteServiceItem(@PathVariable Long id) {
        serviceItemService.deleteServiceItem(id);

        return ResponseEntity.noContent().build();
    }
}
