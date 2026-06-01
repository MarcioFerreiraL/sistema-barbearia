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

    public ServiceItemController(ServiceItemService serviceItemService) {}

    @GetMapping()
    public ResponseEntity<List<ServiceItem>> getAllServiceItems() {
        return new ResponseEntity<>(serviceItemService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/api/services/{id}")
    public ResponseEntity<Optional<ServiceItem>> getAllServiceItemsByServiceId(ServiceItem serviceItem) {
        return new ResponseEntity<>(serviceItemService.getServiceItemById(serviceItem.getId()), HttpStatus.OK);
    }
    @PostMapping("apt/services/{id}")
    public ResponseEntity<ServiceItem> createServiceItem(@PathVariable Long id, @RequestBody ServiceItem serviceItem) {
        ServiceItem createdServiceItem = serviceItemService.createSerivceItem(serviceItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceItem);
    }

    @PutMapping("/api/services/{id}")
    public ResponseEntity<ServiceItem> updateServiceItem(@PathVariable Long id, @RequestBody ServiceItem serviceItem) {
        ServiceItem updatedServiceItem = serviceItemService.updateServiceItem(serviceItem);
        return ResponseEntity.status(HttpStatus.OK).body(updatedServiceItem);
    }

    @DeleteMapping("/api/services/{id}")
    public ResponseEntity<ServiceItem> deleteServiceItem(@PathVariable Long id) {
        try (ServiceItem deletedItemService = serviceItemService.deleteServiceItem(id)) {
            return ResponseEntity.status(HttpStatus.OK).body(deletedItemService);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }
}
