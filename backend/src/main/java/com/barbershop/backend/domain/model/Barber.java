package com.barbershop.backend.domain.model;

import com.barbershop.backend.domain.model.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_barber")
public class Barber extends User{

    public Barber(String fullName, String email, String password, String phoneNumber, boolean active, Role role) {
        super(fullName, email, password, phoneNumber, active, role);
    }

    public Barber(){super();}

}
