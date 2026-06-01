package com.barbershop.backend.domain.model;

import com.barbershop.backend.domain.model.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_customer")
public class Customer extends User{

    public Customer(String fullName, String email, String password, String phoneNumber, boolean active, Role role) {
        super(fullName, email, password, phoneNumber, active, role);
    }

    public Customer() {super();}

    public Customer(String fullName, String email, String password, String phoneNumber) {
        Role role = Role.ROLE_CUSTOMER;
        boolean active = true;
        new Customer(fullName, email, password, phoneNumber, active, role);
    }
}
