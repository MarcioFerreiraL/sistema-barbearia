package com.barbershop.backend.application.controller;

import com.barbershop.backend.domain.model.BusinessHours;
import com.barbershop.backend.service.BusinessHoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/business-hours")
public class BusinessHoursController {

    private final BusinessHoursService businessHoursService;

    public BusinessHoursController(BusinessHoursService businessHoursService) {
        this.businessHoursService = businessHoursService;
    }

    @GetMapping
    public ResponseEntity<List<BusinessHours>> getBusinessHours() {
        return ResponseEntity.ok(businessHoursService.getBusinessHours());
    }

    @PutMapping("/{dayOfWeek}")
    public ResponseEntity<BusinessHours> updateBusinessHours(
            @PathVariable Integer dayOfWeek,
            @RequestBody BusinessHours request) {
        BusinessHours updated = businessHoursService.updateBusinessHours(dayOfWeek, request);
        return ResponseEntity.ok(updated);
    }
}
