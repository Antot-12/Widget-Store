package org.example.widgetstore.widget_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RatingDTO {
    private Long id;
    private Long widgetId;
    private Long userId;
    private String username;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
