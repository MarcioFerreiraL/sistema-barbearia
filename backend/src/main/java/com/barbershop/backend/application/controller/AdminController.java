package com.barbershop.backend.application.controller;

import com.barbershop.backend.application.dto.request.AdminRequest;
import com.barbershop.backend.application.dto.response.AdminResponse;
import com.barbershop.backend.domain.model.Admin;
import com.barbershop.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admins/")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        return new ResponseEntity<>(adminService.getAllAdmins(), HttpStatus.OK);
    }


    @GetMapping("/{id}")
    public ResponseEntity<AdminResponse> getAdminById(@PathVariable UUID id) {
        return new ResponseEntity<>(adminService.getAdminById(id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(@RequestBody AdminRequest admin) {
        AdminResponse adminCreated = adminService.createAdmin(admin);
        return new ResponseEntity<>(adminCreated, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdminResponse> updateAdmin(@PathVariable UUID id, @RequestBody AdminRequest admin) {
        AdminResponse updatedAdmin = adminService.updateAdmin(admin);
        return new ResponseEntity<>(updatedAdmin, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<AdminResponse> deleteCustomer(@PathVariable UUID id) {
        adminService.deleteAdmin(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
