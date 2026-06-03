package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    public Admin getAdminByEmail(String email);
    public Admin getAdminById(UUID id);
    public boolean existsByEmail(String email);
    public boolean existsByPhoneNumber(String phoneNumber);
}
