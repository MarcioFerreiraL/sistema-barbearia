package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.AppointmentRequest;
import com.barbershop.backend.application.dto.response.AppointmentResponse;
import com.barbershop.backend.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable UUID id) {
        AppointmentResponse appointmentResponse = appointmentService.convertToResponseById(id);
        return ResponseEntity.ok(appointmentResponse);
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/update")
    public ResponseEntity<AppointmentResponse> updateAppointment(@RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.updateAppointment(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable UUID id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Void> completeAppointment(@PathVariable UUID id) {
        appointmentService.completeAppointment(id);
        return ResponseEntity.noContent().build();
    }

}
