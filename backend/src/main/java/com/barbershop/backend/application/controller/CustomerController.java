package com.barbershop.backend.application.controller;

import com.barbershop.backend.domain.model.Customer;
import com.barbershop.backend.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("api/customers")
public class CustomerController {

    private final CustomerService customerService;
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return new ResponseEntity<>(customerService.getAllCustomers(), HttpStatus.OK);
    }

    @GetMapping("{email}")
    public ResponseEntity<Optional<Customer>> getCustomerByEmail(@PathVariable String email) {
        return new ResponseEntity<>(customerService.getCustomerByEmail(email), HttpStatus.OK);
    }

    @GetMapping("{phoneNumber}")
    public ResponseEntity<Optional<Customer>> getCustomerByPhoneNumber(@PathVariable String phoneNumber) {
        return new ResponseEntity<>(customerService.getCustomerByPhone(phoneNumber), HttpStatus.OK);
    }

    @GetMapping("{name}")
    public ResponseEntity<Optional<Customer>> getCustomerByName(@PathVariable String name) {
        return new ResponseEntity<>(customerService.getCustomerByName(name), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        Customer createdCustomer = customerService.createCustomer(customer);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable UUID id, @RequestBody Customer customer) {
        if (customerService.verifyCustomer(customer)) {
            Customer updatedCustomer = customerService.updateCustomer(customer);
            return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Customer> deleteCustomer(@PathVariable UUID id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        if (customer.isPresent()) {
            customerService.deleteCustomer(customer.get().getEmail());
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
