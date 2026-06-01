package com.barbershop.backend.service;

import com.barbershop.backend.domain.model.Customer;
import com.barbershop.backend.domain.model.enums.Role;
import org.springframework.stereotype.Service;
import com.barbershop.backend.domain.repository.CustomerRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(UUID id) {
        return customerRepository.getCustomerById(id);
    }
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.getCustomerByEmail(email);
    }

    public Optional<Customer> getCustomerByPhone(String phone) {
        return customerRepository.getCustomerByPhoneNumber(phone);
    }

    public Optional<Customer> getCustomerByName(String name) {
        return customerRepository.getCustomerByName(name);
    }

    public Customer createCustomer(Customer customer) {
        Customer newCustomer = new Customer(customer);
        newCustomer.setRole(Role.ROLE_CUSTOMER);
        if (getAllCustomers().contains(newCustomer)) {
            throw new IllegalArgumentException("Cliente já existe");
        }
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteCustomer(String email) {
        customerRepository.deleteCustomerByEmail(email);
    }

    public boolean verifyCustomer(Customer customer) {
        return getCustomerById(customer.getId()).isPresent();
    }

}
