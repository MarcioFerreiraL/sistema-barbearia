package com.barbershop.backend.service;

import com.barbershop.backend.domain.model.BusinessHours;
import com.barbershop.backend.domain.repository.BusinessHoursRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BusinessHoursService {

    private final BusinessHoursRepository businessHoursRepository;

    public BusinessHoursService(BusinessHoursRepository businessHoursRepository) {
        this.businessHoursRepository = businessHoursRepository;
    }

    public List<BusinessHours> getBusinessHours() {
        return businessHoursRepository.findAll().stream()
                .sorted((a, b) -> a.getDayOfWeek().compareTo(b.getDayOfWeek()))
                .toList();
    }

    @Transactional
    public BusinessHours updateBusinessHours(Integer dayOfWeek, BusinessHours request) {
        BusinessHours existing = businessHoursRepository.findById(dayOfWeek)
                .orElseThrow(() -> new IllegalArgumentException("Dia da semana inválido: " + dayOfWeek));

        existing.setOpen(request.isOpen());
        existing.setOpenTime(request.getOpenTime());
        existing.setCloseTime(request.getCloseTime());

        return businessHoursRepository.save(existing);
    }

    @PostConstruct
    @Transactional
    public void initDefaultHours() {
        if (businessHoursRepository.count() == 0) {
            businessHoursRepository.save(new BusinessHours(1, "Segunda-feira", true, "08:00", "18:00"));
            businessHoursRepository.save(new BusinessHours(2, "Terça-feira", true, "08:00", "18:00"));
            businessHoursRepository.save(new BusinessHours(3, "Quarta-feira", true, "08:00", "18:00"));
            businessHoursRepository.save(new BusinessHours(4, "Quinta-feira", true, "08:00", "18:00"));
            businessHoursRepository.save(new BusinessHours(5, "Sexta-feira", true, "08:00", "18:00"));
            businessHoursRepository.save(new BusinessHours(6, "Sábado", true, "09:00", "13:00"));
            businessHoursRepository.save(new BusinessHours(7, "Domingo", false, "08:00", "18:00"));
        }
    }
}
