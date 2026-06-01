package com.barbershop.backend.service;

import com.barbershop.backend.domain.model.Admin;
import com.barbershop.backend.domain.repository.AdminRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public class AdminService {
    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    private Collection<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(UUID id) {
        return adminRepository.getAdminById(id);
    }
    public Optional<Admin> getAdminByEmail(String email) {return adminRepository.getAdminByEmail(email);}

    public Admin createAdmin(Admin admin) {

        Admin newAdmin = new Admin(
                admin.getFullName(),
                admin.getEmail(),
                admin.getPassword(),
                admin.getPhoneNumber());

        verifyIfExists(newAdmin);
        return adminRepository.save(newAdmin);
    }

    public Admin updateAdmin(Admin admin) {
        verifyIfExists(admin);
        return adminRepository.save(admin);
    }

    public void deleteAdmin(UUID id) {
        Optional<Admin> admin = adminRepository.getAdminById(id);
        if (admin.isPresent()) {
            adminRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Não foi possivel deletar.");
        }
    }

    public void verifyIfExists(Admin admin) {
        if (getAllAdmins().contains(admin)) {
            throw new IllegalArgumentException("Admin já existe");
        }
    }



}
