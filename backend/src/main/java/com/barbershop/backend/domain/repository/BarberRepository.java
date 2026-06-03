package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Barber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BarberRepository extends JpaRepository<Barber, UUID> {
    public Barber getBarberByEmail(String email);
    public Barber getBarberById(UUID id);
    public Barber getBarberByPhoneNumber(String phoneNumber);
    public List<Barber> getBarbersByFullName(String fullname);
    public boolean existsByEmail(String email);
    public boolean existsByPhoneNumber(String phoneNumber);
}
