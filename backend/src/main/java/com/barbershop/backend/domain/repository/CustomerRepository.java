package com.barbershop.backend.domain.repository;

import com.barbershop.backend.domain.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    public Customer getCustomerByEmail(String email);
    public Customer getCustomerById(UUID id);
    public List<Customer> getCustomersByFullName(String fullname);
    public Customer getCustomerByPhoneNumber(String phoneNumber);
    public boolean existsByEmail(String email);
    public boolean existsByPhoneNumber(String phoneNumber);
}
