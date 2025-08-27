package br.rafaalmeida1.nutri_thata_api.dto.response;

import br.rafaalmeida1.nutri_thata_api.enums.NotificationType;
import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private UUID moduleId;
    private String moduleTitle;
    private LocalDateTime createdAt;
    
    // Constructors
    public NotificationResponse() {}
    
    public NotificationResponse(Long id, NotificationType type, String title, String message, 
                               boolean read, UUID moduleId, String moduleTitle, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = read;
        this.moduleId = moduleId;
        this.moduleTitle = moduleTitle;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isRead() {
        return read;
    }
    
    public void setRead(boolean read) {
        this.read = read;
    }
    
    public UUID getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(UUID moduleId) {
        this.moduleId = moduleId;
    }
    
    public String getModuleTitle() {
        return moduleTitle;
    }
    
    public void setModuleTitle(String moduleTitle) {
        this.moduleTitle = moduleTitle;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 