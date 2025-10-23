package org.example.widgetstore.widget_service.dto;

import java.util.List;

/**
 * Stable JSON shape for paged responses.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {}
