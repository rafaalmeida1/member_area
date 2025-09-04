package br.rafaalmeida1.nutri_thata_api.dto.response.analytics;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class PageAnalyticsResponse {
    private Long professionalId;
    private Long totalViews;
    private Long uniqueViews;
    private Long totalClicks;
    private Double averageSessionDuration;
    private List<ViewsByDateResponse> viewsByDate;
    private Map<String, Long> viewsByCountry;
    private Map<String, Long> viewsByDevice;
    private Map<String, Long> viewsByBrowser;
    private List<LinkAnalyticsResponse> topLinks;
    private List<UserClickResponse> authenticatedUsers;
    private LocalDateTime lastViewAt;
}
