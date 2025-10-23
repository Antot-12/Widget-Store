package org.example.widgetstore.widget_service.dto;

import lombok.Data;

@Data
public class RatingStatsDTO {
    private Double averageRating;
    private Integer ratingCount;
    private Integer userRating; // Current user's rating (null if not rated)
}
