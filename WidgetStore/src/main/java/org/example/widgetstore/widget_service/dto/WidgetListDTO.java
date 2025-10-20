package org.example.widgetstore.widget_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WidgetListDTO {

    private Long id;
    private String name;
    private String iconUrl;
    private String description;
    private String category;
    private String imageHint;
    private List<String> tags = new ArrayList<>();
    private Integer downloads;
    private Double averageRating;
    private Integer ratingCount;

}
