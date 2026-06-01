package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {

}
