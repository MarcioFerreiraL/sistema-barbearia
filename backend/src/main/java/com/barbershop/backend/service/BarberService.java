package com.barbershop.backend.service;

import com.barbershop.backend.application.dto.request.BarberRequest;
import com.barbershop.backend.application.dto.response.BarberResponse;
import com.barbershop.backend.domain.model.Barber;
import com.barbershop.backend.domain.model.enums.Role;
import com.barbershop.backend.domain.repository.BarberRepository;
import com.barbershop.backend.service.exception.BusinessRuleException;
import com.barbershop.backend.service.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BarberService {
    private final BarberRepository barberRepository;
    private final PasswordEncoder passwordEncoder;

    public BarberService(BarberRepository barberRepository, PasswordEncoder passwordEncoder) {
        this.barberRepository = barberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<BarberResponse> getAllBarbers() {
        List<Barber> barbers = barberRepository.findAll();

        return barbers.stream()
                .map(this::barberToResponse)
                .collect(Collectors.toList());

    }

    public BarberResponse getBarberById(UUID id) {
        Barber barber = barberRepository.getBarberById(id);
        return barberToResponse(barber);

    }
    public BarberResponse getBarberByEmail(String email) {
        Barber barber = barberRepository.getBarberByEmail(email);
        return barberToResponse(barber);
    }

    public BarberResponse getBarberByPhone(String phone) {
        Barber barber = barberRepository.getBarberByPhoneNumber(phone);
        return barberToResponse(barber);
    }

    public List<BarberResponse> getBarbersByName(String fullname) {
        List<Barber> barbers = barberRepository.getBarbersByFullName(fullname);
        return barbers.stream()
                .map(this::barberToResponse)
                .collect(Collectors.toList());
    }

    public BarberResponse createBarber(BarberRequest request) {
        Barber newBarber = requestToBarber(request);
        validateBarberBusinessRules(newBarber);
        newBarber.setPassword(passwordEncoder.encode(newBarber.getPassword()));
        barberRepository.save(newBarber);
        return barberToResponse(newBarber);
    }

    public BarberResponse updateBarber(BarberRequest request) {
        Barber barber = requestToBarber(request);
        barberRepository.getBarberById(barber.getId());
        validateBarberBusinessRules(barber);
        barberRepository.save(barber);
        return barberToResponse(barber);
    }

    public void deleteBarber(UUID id) {
        Barber barber = barberRepository.getBarberById(id);
        if (barber != null) {
            barberRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Não foi possivel deletar o barbeiro.");
        }
    }

    private void validateBarberBusinessRules(Barber barber) {
        // Regra 1: Nome obrigatório
        if (barber.getFullName() == null || barber.getFullName().isEmpty()) {
            throw new BusinessRuleException("O nome completo é obrigatório.");
        }

        // Regra 2: E-mail obrigatório e único
        if (barber.getEmail() == null || barber.getEmail().isEmpty()) {
            throw new BusinessRuleException("O e-mail é obrigatório.");
        }
        if (barberRepository.existsByEmail(barber.getEmail())) {
            throw new BusinessRuleException("Este e-mail já está em uso por outro utilizador.");
        }

        // Regra 3: Número de telefone obrigatório e único
        if (barber.getPhoneNumber() == null || barber.getPhoneNumber().isEmpty()) {
            throw new BusinessRuleException("O número de telefone é obrigatório.");
        }
        if (barberRepository.existsByPhoneNumber(barber.getPhoneNumber())) {
            throw new BusinessRuleException("Este número de telefone já se encontra registado no sistema.");
        }

        // Regra 4: Segurança mínima da palavra-passe
        if (barber.getPassword() == null || barber.getPassword().length() < 6) {
            throw new BusinessRuleException("A palavra-passe deve ter pelo menos 6 caracteres por motivos de segurança.");
        }

    }

    private BarberResponse barberToResponse(Barber barber) {
        return new BarberResponse(
                barber.getId(),
                barber.getFullName(),
                barber.getEmail(),
                barber.getPhoneNumber(),
                barber.isActive()
        );
    }

    private Barber requestToBarber(BarberRequest request){
        return new Barber(
                request.fullName(),
                request.email(),
                request.password(),
                request.phoneNumber(),
                true,
                Role.ROLE_BARBER
        );
    }
}
