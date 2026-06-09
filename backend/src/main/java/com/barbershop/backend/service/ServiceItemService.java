package com.barbershop.backend.service;

import com.barbershop.backend.application.dto.request.ServiceItemRequest;
import com.barbershop.backend.application.dto.response.ServiceItemResponse;
import com.barbershop.backend.domain.model.ServiceItem;
import com.barbershop.backend.domain.repository.ServiceItemRepository;
import com.barbershop.backend.service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceItemService {

    private ServiceItemRepository serviceItemRepository;

    public ServiceItemService (ServiceItemRepository serviceItemRepository) {
        this.serviceItemRepository = serviceItemRepository;
    }

    public ServiceItemResponse getServiceItemById(Long id) {
        ServiceItem serviceItem = serviceItemRepository.getServiceItemById(id);
        return serviceItemToResponse(serviceItem);
    }

    public List<ServiceItemResponse> getAllServicesItens() {
        List<ServiceItem> serviceItems = serviceItemRepository.findAll();

        return serviceItems.stream()
                .map(this::serviceItemToResponse)
                .collect(Collectors.toList());
    }

    public ServiceItemResponse createServiceItem(ServiceItemRequest request) {
        ServiceItem serviceItem = requestToService(request);
        validateServiceItemBusinessRules(serviceItem);
        serviceItemRepository.save(serviceItem);
        return serviceItemToResponse(serviceItem);
    }

    public ServiceItemResponse updateServiceItem(Long id, ServiceItemRequest request) {
        ServiceItem existingService = serviceItemRepository.getServiceItemById(id);
        if (existingService == null) {
            throw new ResourceNotFoundException("Serviço não encontrado");
        }
        existingService.setName(request.name());
        existingService.setDescription(request.description());
        existingService.setPrice(request.price());
        existingService.setDurationInMinutes(request.durationInMinutes());
        
        validateServiceItemBusinessRules(existingService);
        serviceItemRepository.save(existingService);
        return serviceItemToResponse(existingService);
    }

    public void deleteServiceItem(Long id) {
        ServiceItem serviceItem = serviceItemRepository.getServiceItemById(id);
        if (serviceItem != null) {
            serviceItemRepository.delete(serviceItem);
        } else {
            throw new ResourceNotFoundException("Serviço não encontrado");
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public ServiceItemResponse toggleServiceItemStatus(Long id) {
        ServiceItem serviceItem = serviceItemRepository.getServiceItemById(id);
        if (serviceItem == null) {
            throw new ResourceNotFoundException("Serviço não encontrado");
        }
        serviceItem.setActive(!serviceItem.isActive());
        serviceItemRepository.save(serviceItem);
        return serviceItemToResponse(serviceItem);
    }

    public void validateServiceItemBusinessRules(ServiceItem serviceItem) {
        if (serviceItem.getPrice().signum() < 0) {
            throw new IllegalArgumentException("Preço não pode ser negativo");
        }
    }

    private ServiceItemResponse serviceItemToResponse(ServiceItem serviceItem) {
        return new ServiceItemResponse(
                serviceItem.getId(),
                serviceItem.getName(),
                serviceItem.getDescription(),
                serviceItem.getPrice(),
                serviceItem.getDurationInMinutes(),
                serviceItem.isActive()
        );
    }

    private ServiceItem requestToService(ServiceItemRequest request) {
        return new ServiceItem(
                request.name(),
                request.description(),
                request.price(),
                request.durationInMinutes(),
                true
        );
    }
}

