package org.example.widgetstore.widget_service.controller;

import lombok.RequiredArgsConstructor;
import org.example.widgetstore.widget_service.dto.CreateRatingRequest;
import org.example.widgetstore.widget_service.dto.RatingDTO;
import org.example.widgetstore.widget_service.dto.RatingStatsDTO;
import org.example.widgetstore.widget_service.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/widget/{widgetId}/rating")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping
    public ResponseEntity<RatingStatsDTO> getRatingStats(
            @PathVariable Long widgetId,
            Authentication auth
    ) {
        return ResponseEntity.ok(ratingService.getRatingStats(widgetId, auth));
    }

    @PostMapping
    public ResponseEntity<RatingDTO> createOrUpdateRating(
            @PathVariable Long widgetId,
            @RequestBody CreateRatingRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(ratingService.createOrUpdateRating(widgetId, request, auth));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long widgetId,
            Authentication auth
    ) {
        ratingService.deleteRating(widgetId, auth);
        return ResponseEntity.noContent().build();
    }
}
