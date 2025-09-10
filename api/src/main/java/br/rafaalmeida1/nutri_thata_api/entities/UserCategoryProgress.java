package br.rafaalmeida1.nutri_thata_api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_category_progress", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserCategoryProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "modules_viewed")
    @Builder.Default
    private Integer modulesViewed = 0;

    @Column(name = "modules_completed")
    @Builder.Default
    private Integer modulesCompleted = 0;

    @Column(name = "total_time_spent")
    @Builder.Default
    private Long totalTimeSpent = 0L; // em segundos

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
