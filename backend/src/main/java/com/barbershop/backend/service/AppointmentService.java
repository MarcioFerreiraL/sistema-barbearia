package com.barbershop.backend.service;

import com.barbershop.backend.application.dto.request.AppointmentRequest;
import com.barbershop.backend.application.dto.response.AppointmentResponse;
import com.barbershop.backend.domain.model.Appointment;
import com.barbershop.backend.domain.model.Barber;
import com.barbershop.backend.domain.model.Customer;
import com.barbershop.backend.domain.model.ServiceItem;
import com.barbershop.backend.domain.model.enums.AppointmentStatus;
import com.barbershop.backend.domain.repository.AppointmentRepository;
import com.barbershop.backend.domain.repository.BarberRepository;
import com.barbershop.backend.domain.repository.CustomerRepository;
import com.barbershop.backend.domain.repository.ServiceItemRepository;
import com.barbershop.backend.service.exception.BusinessRuleException;
import com.barbershop.backend.service.exception.ResourceNotFoundException;
import com.barbershop.backend.domain.repository.BusinessHoursRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final BusinessHoursRepository businessHoursRepository;

    public AppointmentService(ServiceItemRepository serviceItemRepository, CustomerRepository customerRepository, BarberRepository barberRepository, AppointmentRepository appointmentRepository, BusinessHoursRepository businessHoursRepository) {
        this.serviceItemRepository = serviceItemRepository;
        this.customerRepository = customerRepository;
        this.barberRepository = barberRepository;
        this.appointmentRepository = appointmentRepository;
        this.businessHoursRepository = businessHoursRepository;
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {

        Appointment appointment = requestToAppointment(request);
        businessRules(appointment);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToResponse(savedAppointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(AppointmentRequest request) {

        Appointment appointment = requestToAppointment(request);
        if (getAllAppointments().contains(appointment)) {
            businessRules(appointment);
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

    @Transactional
    public void cancelAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));

        // Máquina de Estados: Só cancela se estiver agendado
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BusinessRuleException("Este agendamento já se encontra cancelado.");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessRuleException("Não é possível cancelar um agendamento que já foi finalizado.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
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

    private Appointment businessRules(Appointment appointment) {
        // --- 1. VALIDAÇÕES DE DATA E HORA DA BARBEARIA ---
        LocalDateTime startTime = appointment.getStartTime();

        // Regra: Não pode agendar no passado
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Não é possível agendar um horário no passado.");
        }

        // Regra: Horários e Dias Dinâmicos do Banco de Dados
        int dayOfWeekVal = startTime.getDayOfWeek().getValue(); // 1 = Monday, ..., 7 = Sunday
        com.barbershop.backend.domain.model.BusinessHours hours = businessHoursRepository.findById(dayOfWeekVal)
                .orElseThrow(() -> new BusinessRuleException("Configuração de funcionamento não encontrada para o dia da semana."));

        if (!hours.isOpen()) {
            throw new BusinessRuleException("A barbearia não funciona aos " + hours.getDayName() + "s.");
        }

        LocalTime appointmentTime = startTime.toLocalTime();
        LocalTime openTime = LocalTime.parse(hours.getOpenTime());
        LocalTime closeTime = LocalTime.parse(hours.getCloseTime());

        if (appointmentTime.isBefore(openTime) || appointmentTime.isAfter(closeTime.minusMinutes(appointment.getServiceItem().getDurationInMinutes()))) {
            throw new BusinessRuleException("O horário selecionado está fora do horário de funcionamento configurado (" + hours.getOpenTime() + " às " + hours.getCloseTime() + ").");
        }

        // --- 2. BUSCA E VALIDAÇÃO DE REGISTROS INATIVOS ---
        Customer customer = customerRepository.findById(appointment.getCustomer().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado."));

        Barber barber = barberRepository.findById(appointment.getBarber().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Barbeiro não encontrado."));
        if (!barber.isActive()) {
            throw new BusinessRuleException("Este barbeiro não está mais ativo na empresa.");
        }

        ServiceItem serviceItem = serviceItemRepository.findById(appointment.getServiceItem().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado."));
        if (!serviceItem.isActive()) {
            throw new BusinessRuleException("Este serviço não está mais disponível no catálogo.");
        }

        // --- 3. VALIDAÇÃO DE CONFLITO DE AGENDA ---
        LocalDateTime endTime = startTime.plusMinutes(serviceItem.getDurationInMinutes());
        if (appointmentRepository.existsOverlappingAppointment(barber, startTime, endTime)) {
            throw new BusinessRuleException("O barbeiro selecionado já possui um agendamento neste horário.");
        }

        return appointment;
    }


}
