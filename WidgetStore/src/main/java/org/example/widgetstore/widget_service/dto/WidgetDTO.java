package org.example.widgetstore.widget_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WidgetDTO {

    private Long id;
    private String name;
    private String api;
    private String description;
    private String category;
    private String iconUrl;
    private String fileUrl;
    private String imageHint;

    private List<String> tags = new ArrayList<>();
    private List<String> keyFeatures = new ArrayList<>();
    private String whatsNew;
    private String moreInfo;
    private List<String> screenshotUrls = new ArrayList<>();

    // Statistics
    private Integer downloads;
    private Long sizeBytes;
    private Double averageRating;
    private Integer ratingCount;
    private Integer commentCount;

}
