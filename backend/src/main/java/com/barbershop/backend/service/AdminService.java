package com.barbershop.backend.service;

import com.barbershop.backend.application.dto.request.AdminRequest;
import com.barbershop.backend.application.dto.response.AdminResponse;
import com.barbershop.backend.domain.model.Admin;
import com.barbershop.backend.domain.model.enums.Role;
import com.barbershop.backend.domain.repository.AdminRepository;
import com.barbershop.backend.service.exception.BusinessRuleException;
import com.barbershop.backend.service.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AdminResponse> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return admins.stream()
                .map(this::adminToResponse)
                .collect(Collectors.toList());

    }

    public AdminResponse getAdminById(UUID id) {
        Admin admin = adminRepository.getAdminById(id);
        return adminToResponse(admin);

    }
    public AdminResponse getAdminByEmail(String email) {
        Admin admin = adminRepository.getAdminByEmail(email);
        return adminToResponse(admin);
    }

    public AdminResponse createAdmin(AdminRequest request) {
        if (adminRepository.count() > 0) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                throw new BusinessRuleException("Apenas administradores podem cadastrar novos administradores.");
            }
        }

        Admin newAdmin = requestToAdmin(request);
        newAdmin.setPassword(passwordEncoder.encode(newAdmin.getPassword()));
        validateAdminBusinessRules(newAdmin);
        adminRepository.save(newAdmin);
        return adminToResponse(newAdmin);
    }

    public AdminResponse updateAdmin(UUID id, AdminRequest request) {
        Admin existingAdmin = adminRepository.getAdminById(id);
        if (existingAdmin == null) {
            throw new ResourceNotFoundException("Administrador não encontrado com o ID fornecido.");
        }

        if (request.fullName() == null || request.fullName().trim().isEmpty()) {
            throw new BusinessRuleException("O nome completo é obrigatório.");
        }

        if (request.email() == null || request.email().trim().isEmpty()) {
            throw new BusinessRuleException("O e-mail é obrigatório.");
        }
        if (!existingAdmin.getEmail().equalsIgnoreCase(request.email()) &&
                adminRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Este e-mail já está em uso por outro utilizador.");
        }

        if (request.phoneNumber() == null || request.phoneNumber().trim().isEmpty()) {
            throw new BusinessRuleException("O número de telefone é obrigatório.");
        }
        if (!existingAdmin.getPhoneNumber().equals(request.phoneNumber()) &&
                adminRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new BusinessRuleException("Este número de telefone já se encontra registado no sistema.");
        }

        if (request.password() != null && !request.password().trim().isEmpty()) {
            if (request.password().length() < 6) {
                throw new BusinessRuleException("A palavra-passe deve ter pelo menos 6 caracteres por motivos de segurança.");
            }
            existingAdmin.setPassword(passwordEncoder.encode(request.password()));
        }

        existingAdmin.setFullName(request.fullName());
        existingAdmin.setEmail(request.email());
        existingAdmin.setPhoneNumber(request.phoneNumber());

        Admin savedAdmin = adminRepository.save(existingAdmin);
        return adminToResponse(savedAdmin);
    }


    public void deleteAdmin(UUID id) {
        Admin admin = adminRepository.getAdminById(id);
        if (admin != null) {
            adminRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Admin with id " + id + " não encontrado!");
        }
    }

    public AdminResponse adminToResponse(Admin admin) {
        return new AdminResponse(
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getPhoneNumber(),
                true
        );
    }

    public Admin requestToAdmin(AdminRequest request) {
        return new Admin(
                request.fullName(),
                request.email(),
                request.password(),
                request.phoneNumber(),
                true,
                Role.ROLE_ADMIN
        );
    }

    private void validateAdminBusinessRules(Admin admin) {
        // Regra 1: Nome obrigatório
        if (admin.getFullName() == null || admin.getFullName().isEmpty()) {
            throw new BusinessRuleException("O nome completo é obrigatório.");
        }

        // Regra 2: E-mail obrigatório e único
        if (admin.getEmail() == null || admin.getEmail().isEmpty()) {
            throw new BusinessRuleException("O e-mail é obrigatório.");
        }
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new BusinessRuleException("Este e-mail já está em uso por outro utilizador.");
        }

        // Regra 3: Número de telefone obrigatório e único
        if (admin.getPhoneNumber() == null || admin.getPhoneNumber().isEmpty()) {
            throw new BusinessRuleException("O número de telefone é obrigatório.");
        }
        if (adminRepository.existsByPhoneNumber(admin.getPhoneNumber())) {
            throw new BusinessRuleException("Este número de telefone já se encontra registado no sistema.");
        }

        // Regra 4: Segurança mínima da palavra-passe
        if (admin.getPassword() == null || admin.getPassword().length() < 6) {
            throw new BusinessRuleException("A palavra-passe deve ter pelo menos 6 caracteres por motivos de segurança.");
        }

    }

}
