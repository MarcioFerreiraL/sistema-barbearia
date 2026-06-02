package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    public Optional<Admin> getAdminByEmail(String email);
    public Optional<Admin> getAdminById(UUID id);
}
