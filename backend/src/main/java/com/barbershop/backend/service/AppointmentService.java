package com.barbershop.backend.service;

import com.barbershop.backend.application.dto.request.AppointmentRequest;
import com.barbershop.backend.application.dto.response.AppointmentResponse;
import com.barbershop.backend.domain.model.Appointment;
import com.barbershop.backend.domain.model.Barber;
import com.barbershop.backend.domain.model.Customer;
import com.barbershop.backend.domain.model.ServiceItem;
import com.barbershop.backend.domain.repository.AppointmentRepository;
import com.barbershop.backend.domain.repository.BarberRepository;
import com.barbershop.backend.domain.repository.CustomerRepository;
import com.barbershop.backend.domain.repository.ServiceItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final BarberRepository barberRepository;
    private final ServiceItemRepository serviceItemRepository;

    public AppointmentService(ServiceItemRepository serviceItemRepository, CustomerRepository customerRepository, BarberRepository barberRepository, AppointmentRepository appointmentRepository) {
        this.serviceItemRepository = serviceItemRepository;
        this.customerRepository = customerRepository;
        this.barberRepository = barberRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {

        Appointment appointment = requestToAppointment(request);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return convertToResponse(savedAppointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(AppointmentRequest request) {

        Appointment appointment = requestToAppointment(request);
        if (getAllAppointments().contains(appointment)) {
            Appointment savedAppointment = appointmentRepository.save(appointment);
            return convertToResponse(savedAppointment);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado");
        }
    }

    @Transactional
    public void  deleteAppointment(AppointmentRequest request) {
        Appointment appointment = requestToAppointment(request);
        if (getAllAppointments().contains(appointment)) {
            appointmentRepository.delete(appointment);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado");
        }
    }

    public Optional<Appointment> getAppointmentById(UUID id) {
        return appointmentRepository.findById(id);
    }

    public Optional<Appointment> getAppointmentByBarberId(UUID barberId) {
        return appointmentRepository.getAppointmentByBarberId(barberId);
    }

    public Optional<Appointment> getAppointmentByServiceItemId(UUID serviceItemId) {
        return appointmentRepository.getAppointmentByServiceItemId(serviceItemId);
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse convertToResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getCustomer().getFullName(),
                appointment.getBarber().getFullName(),
                appointment.getServiceItem().getName(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getStatus()
        );
    }

    public AppointmentResponse convertToResponseById(UUID id) {
        Appointment appointment = appointmentRepository.getReferenceById(id);
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getCustomer().getFullName(),
                appointment.getBarber().getFullName(),
                appointment.getServiceItem().getName(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getStatus()
        );
    }

    private Appointment requestToAppointment(AppointmentRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

        Barber barber = barberRepository.findById(request.barberId())
                .orElseThrow(() -> new IllegalArgumentException("Barbeiro não encontrado"));

        ServiceItem serviceItem = serviceItemRepository.findById(request.serviceItemId())
                .orElseThrow(() -> new IllegalArgumentException("Serviço não encontrado"));

        Appointment appointment = new Appointment(customer, barber, serviceItem, request.startTime());

        LocalDateTime endTime = appointment.getStartTime().plusMinutes(appointment.getServiceItem().getDurationInMinutes());

        if (appointmentRepository.existsOverlappingAppointment(appointment.getBarber(), appointment.getStartTime(), endTime)) {
            throw new IllegalArgumentException("O barbeiro não está disponivel nesse horário");
        }

        return appointment;
    }


}
