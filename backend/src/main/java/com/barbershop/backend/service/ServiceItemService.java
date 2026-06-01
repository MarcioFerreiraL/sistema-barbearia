package com.barbershop.backend.service;

import com.barbershop.backend.domain.model.ServiceItem;
import com.barbershop.backend.domain.repository.ServiceItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServiceItemService {

    private ServiceItemRepository serviceItemRepository;

    public ServiceItemService (ServiceItemRepository serviceItemRepository) {}

    public Optional<ServiceItem> getServiceItemById(Long id) {
        return serviceItemRepository.findById(id);
    }

    public List<ServiceItem> getAll() {
        return serviceItemRepository.findAll();
    }

    public ServiceItem createSerivceItem(ServiceItem serviceItem) {
        // Implementar regra de negocio
        if (serviceItem.getPrice().signum() < 0) {
            throw new IllegalArgumentException("Preço não pode ser negativo");
        }
        return serviceItemRepository.save(serviceItem);
    }

    public ServiceItem updateServiceItem(ServiceItem serviceItem) {
        return serviceItemRepository.save(serviceItem);
    }

    public ServiceItem deleteServiceItem(Long id) {
        return serviceItemRepository.deleteById(id);

    }
}
