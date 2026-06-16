package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Integer> {
}
