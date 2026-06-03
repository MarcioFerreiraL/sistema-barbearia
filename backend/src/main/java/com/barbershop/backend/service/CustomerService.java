package com.barbershop.backend.service;

import com.barbershop.backend.application.dto.request.CustomerRequest;
import com.barbershop.backend.application.dto.response.CustomerResponse;
import com.barbershop.backend.domain.model.Customer;
import com.barbershop.backend.domain.model.enums.Role;
import com.barbershop.backend.service.exception.BusinessRuleException;
import com.barbershop.backend.service.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.barbershop.backend.domain.repository.CustomerRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository,  PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<CustomerResponse> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();

        // Transforma a lista de Customer em CustomerResponse usando Streams
        return customers.stream()
                .map(this::customerToResponse) // Chama a sua função de conversão para cada cliente
                .collect(Collectors.toList()); // Junta tudo numa nova List<CustomerResponse>
    }

    public CustomerResponse getCustomerById(UUID id) {
        Customer customer = customerRepository.getCustomerById(id);
        return customerToResponse(customer);
    }

    public CustomerResponse getCustomerByEmail(String email) {
        Customer customer = customerRepository.getCustomerByEmail(email);
        return customerToResponse(customer);
    }

    public CustomerResponse getCustomerByPhone(String phone) {
        Customer customer = customerRepository.getCustomerByPhoneNumber(phone);
        return customerToResponse(customer);
    }

    public List<CustomerResponse> getCustomersByName(String fullname) {
        List<Customer> customers = customerRepository.getCustomersByFullName(fullname);
        return customers.stream()
                .map(this::customerToResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse createCustomer(CustomerRequest request) {

        Customer customer = requestToCustomer(request);
        customer.setRole(Role.ROLE_CUSTOMER);
        customer.setActive(true);
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        validateCustomerBusinessRules(customer);
        Customer savedCustomer = customerRepository.save(customer);
        return customerToResponse(savedCustomer);
    }

    public CustomerResponse updateCustomer(CustomerRequest request) {
        Customer customer = requestToCustomer(request);
        customerRepository.getCustomerById(customer.getId());
        validateCustomerBusinessRules(customer);
        customerRepository.save(customer);
        return customerToResponse(customer);
    }

    public void deleteCustomer(UUID id) {
        Customer customer = customerRepository.getCustomerById(id);
        if (customer != null) {
            customerRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Cliente com id" + id + "não encontrado");
        }
    }

    public Customer requestToCustomer(CustomerRequest request) {
        return new Customer(
                request.fullName(),
                request.email(),
                request.password(),
                request.phoneNumber(),
                true,
                Role.ROLE_CUSTOMER
        );
    }

    private void validateCustomerBusinessRules(Customer customer) {
        // Regra 1: Nome obrigatório
        if (customer.getFullName() == null || customer.getFullName().isEmpty()) {
            throw new BusinessRuleException("O nome completo é obrigatório.");
        }

        // Regra 2: E-mail obrigatório e único
        if (customer.getEmail() == null || customer.getEmail().isEmpty()) {
            throw new BusinessRuleException("O e-mail é obrigatório.");
        }
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new BusinessRuleException("Este e-mail já está em uso por outro utilizador.");
        }

        // Regra 3: Número de telefone obrigatório e único
        if (customer.getPhoneNumber() == null || customer.getPhoneNumber().isEmpty()) {
            throw new BusinessRuleException("O número de telefone é obrigatório.");
        }
        if (customerRepository.existsByPhoneNumber(customer.getPhoneNumber())) {
            throw new BusinessRuleException("Este número de telefone já se encontra registado no sistema.");
        }

        // Regra 4: Segurança mínima da palavra-passe
        if (customer.getPassword() == null || customer.getPassword().length() < 6) {
            throw new BusinessRuleException("A palavra-passe deve ter pelo menos 6 caracteres por motivos de segurança.");
        }

    }

    private CustomerResponse customerToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.isActive()
        );
    }
}
