package com.barbershop.backend.service;

import com.barbershop.backend.domain.model.ServiceItem;
import com.barbershop.backend.domain.repository.ServiceItemRepository;
import com.barbershop.backend.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceItemService {

    private ServiceItemRepository serviceItemRepository;

    public ServiceItemService (ServiceItemRepository serviceItemRepository) {
        this.serviceItemRepository = serviceItemRepository;
    }

    public ServiceItem getServiceItemById(Long id) {
        return serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado."));
    }

    public List<ServiceItem> getAll() {
        return serviceItemRepository.findAll();
    }

    public ServiceItem createServiceItem(ServiceItem serviceItem) {
        // Implementar regra de negocio
        if (serviceItem.getPrice().signum() < 0) {
            throw new IllegalArgumentException("Preço não pode ser negativo");
        }
        return serviceItemRepository.save(serviceItem);
    }

    public ServiceItem updateServiceItem(ServiceItem serviceItem) {
        return serviceItemRepository.save(serviceItem);
    }

    public void deleteServiceItem(Long id) {
        serviceItemRepository.deleteById(id);

    }

    public boolean verifyServiceItem(ServiceItem serviceItem) {
        return getServiceItemById(serviceItem.getId()) != null;
    }
}

