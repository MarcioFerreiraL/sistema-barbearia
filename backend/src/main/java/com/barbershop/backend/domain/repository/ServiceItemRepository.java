package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    public ServiceItem getServiceItemById(Long id);
    public List<ServiceItem> getServiceItemsByCustomerId(UUID customerId);
    public List<ServiceItem> getServiceItemsByServiceItemId(Long serviceItemId);
}
