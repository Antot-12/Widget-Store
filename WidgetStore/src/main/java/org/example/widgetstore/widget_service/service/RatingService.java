package org.example.widgetstore.widget_service.service;

import lombok.RequiredArgsConstructor;
import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.user_service.repo.UserRepository;
import org.example.widgetstore.widget_service.dto.CreateRatingRequest;
import org.example.widgetstore.widget_service.dto.RatingDTO;
import org.example.widgetstore.widget_service.dto.RatingStatsDTO;
import org.example.widgetstore.widget_service.entity.Rating;
import org.example.widgetstore.widget_service.entity.Widget;
import org.example.widgetstore.widget_service.repo.RatingRepository;
import org.example.widgetstore.widget_service.repo.WidgetRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final WidgetRepository widgetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public RatingStatsDTO getRatingStats(Long widgetId, Authentication auth) {
        Widget widget = widgetRepository.findById(widgetId)
                .orElseThrow(() -> new RuntimeException("Widget not found"));

        RatingStatsDTO stats = new RatingStatsDTO();
        stats.setAverageRating(widget.getAverageRating());
        stats.setRatingCount(widget.getRatingCount());

        // Get user's rating if authenticated
        if (auth != null) {
            String username = auth.getName();
            userRepository.findByUsername(username).ifPresent(user -> {
                ratingRepository.findByWidgetAndUser(widget, user)
                        .ifPresent(rating -> stats.setUserRating(rating.getRating()));
            });
        }

        return stats;
    }

    @Transactional
    public RatingDTO createOrUpdateRating(Long widgetId, CreateRatingRequest request, Authentication auth) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Widget widget = widgetRepository.findById(widgetId)
                .orElseThrow(() -> new RuntimeException("Widget not found"));

        // Check if user already rated this widget
        Optional<Rating> existingRating = ratingRepository.findByWidgetAndUser(widget, user);

        Rating rating;
        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();
            rating.setRating(request.getRating());
        } else {
            // Create new rating
            rating = new Rating();
            rating.setWidget(widget);
            rating.setUser(user);
            rating.setRating(request.getRating());
        }

        Rating savedRating = ratingRepository.save(rating);

        // Update widget statistics
        updateWidgetRatingStats(widget);

        return toDTO(savedRating);
    }

    @Transactional
    public void deleteRating(Long widgetId, Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Widget widget = widgetRepository.findById(widgetId)
                .orElseThrow(() -> new RuntimeException("Widget not found"));

        Rating rating = ratingRepository.findByWidgetAndUser(widget, user)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        ratingRepository.delete(rating);

        // Update widget statistics
        updateWidgetRatingStats(widget);
    }

    private void updateWidgetRatingStats(Widget widget) {
        Double avgRating = ratingRepository.getAverageRatingForWidget(widget);
        long count = ratingRepository.countByWidget(widget);

        widget.setAverageRating(avgRating != null ? avgRating : 0.0);
        widget.setRatingCount((int) count);
        widgetRepository.save(widget);
    }

    private RatingDTO toDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setId(rating.getId());
        dto.setWidgetId(rating.getWidget().getId());
        dto.setUserId(rating.getUser().getId());
        dto.setUsername(rating.getUser().getUsername());
        dto.setRating(rating.getRating());
        dto.setCreatedAt(rating.getCreatedAt());
        dto.setUpdatedAt(rating.getUpdatedAt());
        return dto;
    }
}
