package com.barbershop.backend.domain.model;

import com.barbershop.backend.domain.model.enums.Role;

public class Admin extends User{
    public Admin(String fullName, String email, String password, String phoneNumber, boolean active, Role role) {
        super(fullName, email, password, phoneNumber, active, role);
    }

    public Admin() {
        super();
    }

    public Admin(String fullName, String email, String password, String phoneNumber) {
        Role role = Role.ROLE_ADMIN;
        boolean active = true;
        new Customer(fullName, email, password, phoneNumber, active, role);
    }
}
