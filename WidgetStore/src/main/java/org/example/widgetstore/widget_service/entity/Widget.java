package org.example.widgetstore.widget_service.entity;


import jakarta.persistence.*;
import lombok.Data;
import org.example.widgetstore.user_service.entity.User;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class Widget {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String api;

    @Column(length = 1000)
    private String description;

    private String category;

    private String iconUrl;
    private String fileUrl;

    // Image hint for UI
    private String imageHint;

    private int downloads;

    @Column(nullable = true)
    private Long sizeBytes;

    @ManyToOne
    private User createdBy;

    // Tags for search and filtering
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "widget_tags",
            joinColumns = @JoinColumn(name = "widget_id")
    )
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // Key features list
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "widget_features",
            joinColumns = @JoinColumn(name = "widget_id")
    )
    @Column(name = "feature", length = 500)
    @OrderColumn(name = "position")
    private List<String> keyFeatures = new ArrayList<>();

    // What's new / changelog (supports Markdown)
    @Column(length = 5000)
    private String whatsNew;

    // More info / metadata (supports Markdown table format)
    @Column(length = 2000)
    private String moreInfo;

    // Screenshots
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "widget_screenshot",
            joinColumns = @JoinColumn(name = "widget_id")
    )
    @Column(name = "url", length = 2048, nullable = false)
    @OrderColumn(name = "position")
    private List<String> screenshotUrls = new ArrayList<>();

    // Rating statistics
    @Column(nullable = false)
    private Double averageRating = 0.0;

    @Column(nullable = false)
    private Integer ratingCount = 0;

    @Column(nullable = false)
    private Integer commentCount = 0;

}
