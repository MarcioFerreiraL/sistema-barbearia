package com.barbershop.backend.application.controller;

import com.barbershop.backend.domain.model.Barber;
import com.barbershop.backend.service.BarberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/barbers/")
public class BarberController {
    private final BarberService barberService;
    public BarberController(BarberService barberService) {
        this.barberService = barberService;
    }

    @GetMapping
    public ResponseEntity<List<Barber>> getAllBarbers() {
        return new ResponseEntity<>(barberService.getAllBarbers(), HttpStatus.OK);
    }

    @GetMapping("{email}")
    public ResponseEntity<Optional<Barber>> getBarberByEmail(@PathVariable String email) {
        return new ResponseEntity<>(barberService.getBarberByEmail(email), HttpStatus.OK);
    }

    @GetMapping("{phoneNumber}")
    public ResponseEntity<Optional<Barber>> getBarberByPhoneNumber(@PathVariable String phoneNumber) {
        return new ResponseEntity<>(barberService.getBarberByPhone(phoneNumber), HttpStatus.OK);
    }

    @GetMapping("{name}")
    public ResponseEntity<Optional<Barber>> getBarberByName(@PathVariable String name) {
        return new ResponseEntity<>(barberService.getBarberByName(name), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Barber> createBarber(@RequestBody Barber barber) {
        Barber createdCustomer = barberService.createBarber(barber);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Barber> updateBarber(@RequestBody Barber barber) {
        Barber updatedBarber = barberService.updateBarber(barber);
        return new ResponseEntity<>(updatedBarber, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Barber> deleteBarber(@PathVariable UUID id) {
        barberService.deleteBarber(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
