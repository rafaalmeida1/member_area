package br.rafaalmeida1.nutri_thata_api.dto.response.analytics;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class LinkAnalyticsResponse {
    private Long linkId;
    private String linkTitle;
    private Long totalClicks;
    private Long uniqueClicks;
    private List<ClicksByDateResponse> clicksByDate;
    private Map<String, Long> clicksByCountry;
    private Map<String, Long> clicksByDevice;
    private Map<String, Long> clicksByBrowser;
    private LocalDateTime lastClickAt;
}
