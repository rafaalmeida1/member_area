package br.rafaalmeida1.nutri_thata_api.entities;

import br.rafaalmeida1.nutri_thata_api.enums.Role;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // ========== THEME COLORS ==========
    
    @Column(name = "theme_primary_color")
    private String themePrimaryColor;
    
    @Column(name = "theme_secondary_color")
    private String themeSecondaryColor;
    
    @Column(name = "theme_accent_color")
    private String themeAccentColor;
    
    @Column(name = "theme_background_color")
    private String themeBackgroundColor;
    
    @Column(name = "theme_surface_color")
    private String themeSurfaceColor;
    
    @Column(name = "theme_text_color")
    private String themeTextColor;
    
    @Column(name = "theme_text_secondary_color")
    private String themeTextSecondaryColor;
    
    @Column(name = "theme_border_color")
    private String themeBorderColor;
    
    @Column(name = "theme_input_bg_color")
    private String themeInputBgColor;
    
    @Column(name = "theme_input_border_color")
    private String themeInputBorderColor;
    
    @Column(name = "theme_input_focus_color")
    private String themeInputFocusColor;
    
    @Column(name = "theme_button_primary_bg")
    private String themeButtonPrimaryBg;
    
    @Column(name = "theme_button_primary_hover")
    private String themeButtonPrimaryHover;
    
    @Column(name = "theme_button_primary_text")
    private String themeButtonPrimaryText;
    
    @Column(name = "theme_button_secondary_bg")
    private String themeButtonSecondaryBg;
    
    @Column(name = "theme_button_secondary_hover")
    private String themeButtonSecondaryHover;
    
    @Column(name = "theme_button_secondary_text")
    private String themeButtonSecondaryText;
    
    @Column(name = "theme_button_disabled_bg")
    private String themeButtonDisabledBg;
    
    @Column(name = "theme_button_disabled_text")
    private String themeButtonDisabledText;
    
    @Column(name = "theme_success_color")
    private String themeSuccessColor;
    
    @Column(name = "theme_warning_color")
    private String themeWarningColor;
    
    @Column(name = "theme_error_color")
    private String themeErrorColor;
    
    @Column(name = "theme_info_color")
    private String themeInfoColor;
    
    @Column(name = "selected_theme")
    private String selectedTheme;

    // ========== SPRING SECURITY METHODS ==========

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}