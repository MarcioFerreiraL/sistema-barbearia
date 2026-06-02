package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Barber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BarberRepository extends JpaRepository<Barber, UUID> {
    public Optional<Barber> getBarberByEmail(String email);
    public Optional<Barber> getBarberById(UUID id);
    public Optional<Barber> getBarberByFullName(String fullname);
    public Optional<Barber> getBarberByPhoneNumber(String phoneNumber);
    public void deleteBarberByEmail(String email);
}
