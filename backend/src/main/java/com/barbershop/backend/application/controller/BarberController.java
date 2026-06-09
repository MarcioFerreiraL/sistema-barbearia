package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.BarberRequest;
import com.barbershop.backend.application.dto.response.BarberResponse;
import com.barbershop.backend.service.BarberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/barbers")
public class BarberController {
    private final BarberService barberService;
    public BarberController(BarberService barberService) {
        this.barberService = barberService;
    }

    @GetMapping
    public ResponseEntity<List<BarberResponse>> getAllBarbers() {
        return new ResponseEntity<>(barberService.getAllBarbers(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BarberResponse> getBarberByEmail(@PathVariable UUID id) {
        return new ResponseEntity<>(barberService.getBarberById(id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<BarberResponse> createBarber(@RequestBody BarberRequest barber) {
        BarberResponse createdCustomer = barberService.createBarber(barber);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BarberResponse> updateBarber(@PathVariable UUID id, @RequestBody BarberRequest barber) {
        BarberResponse updatedBarber = barberService.updateBarber(id, barber);
        return new ResponseEntity<>(updatedBarber, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BarberResponse> deleteBarber(@PathVariable UUID id) {
        barberService.deleteBarber(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<BarberResponse> toggleBarberStatus(@PathVariable UUID id) {
        BarberResponse updatedBarber = barberService.toggleBarberStatus(id);
        return new ResponseEntity<>(updatedBarber, HttpStatus.OK);
    }
}
