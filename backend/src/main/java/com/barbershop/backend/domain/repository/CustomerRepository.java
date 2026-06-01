package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    public Optional<Customer> getCustomerByEmail(String email);
    public Optional<Customer> getCustomerById(UUID id);
    public Optional<Customer> getCustomerByName(String username);
    public Optional<Customer> getCustomerByPhoneNumber(String phoneNumber);
    public void deleteCustomerByEmail(String email);
}
