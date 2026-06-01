package com.barbershop.backend.service;

import com.barbershop.backend.domain.model.Barber;
import com.barbershop.backend.domain.repository.BarberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BarberService {
    private final BarberRepository barberRepository;

    public BarberService(BarberRepository barberRepository) {
        this.barberRepository = barberRepository;
    }

    public List<Barber> getAllBarbers() {
        return barberRepository.findAll();
    }

    public Optional<Barber> getBarberById(UUID id) {
        return barberRepository.getBarberById(id);
    }
    public Optional<Barber> getBarberByEmail(String email) {
        return barberRepository.getBarberByEmail(email);
    }

    public Optional<Barber> getBarberByPhone(String phone) {
        return barberRepository.getBarberByPhoneNumber(phone);
    }

    public Optional<Barber> getBarberByName(String name) {
        return barberRepository.getBarberByName(name);
    }

    public Barber createBarber(Barber barber) {

        Barber newBarber = new Barber(
                barber.getFullName(),
                barber.getEmail(),
                barber.getPassword(),
                barber.getPhoneNumber());

        verifyIfExists(newBarber);
        return barberRepository.save(newBarber);
    }

    public Barber updateBarber(Barber barber) {
        if (getAllBarbers().contains(barber)) {
            throw new IllegalArgumentException("Barbeiro já existe");
        }
        return barberRepository.save(barber);
    }

    public void deleteBarber(UUID id) {
        Optional<Barber> barber = barberRepository.getBarberById(id);
        if (barber.isPresent()) {
            barberRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Não foi possivel deletar o barbeiro.");
        }
    }

    public void verifyIfExists(Barber barber) {
        if (getAllBarbers().contains(barber)) {
            throw new IllegalArgumentException("Barbeiro já existe");
        }
    }
}
