package org.example.widgetstore.widget_service.dto;

import org.example.widgetstore.widget_service.entity.Widget;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class WidgetMapper {

    public WidgetListDTO toListDto(Widget widget) {
        return new WidgetListDTO(
                widget.getId(),
                widget.getName(),
                widget.getIconUrl(),
                widget.getDescription(),
                widget.getCategory(),
                widget.getImageHint(),
                widget.getTags() != null ? widget.getTags() : new ArrayList<>(),
                widget.getDownloads(),
                widget.getAverageRating(),
                widget.getRatingCount()
        );
    }

    public WidgetDTO toDto(Widget widget) {
        WidgetDTO dto = new WidgetDTO();
        dto.setId(widget.getId());
        dto.setName(widget.getName());
        dto.setDescription(widget.getDescription());
        dto.setCategory(widget.getCategory());
        dto.setIconUrl(widget.getIconUrl());
        dto.setFileUrl(widget.getFileUrl());
        dto.setImageHint(widget.getImageHint());
        dto.setTags(widget.getTags() != null ? widget.getTags() : new ArrayList<>());
        dto.setKeyFeatures(widget.getKeyFeatures() != null ? widget.getKeyFeatures() : new ArrayList<>());
        dto.setWhatsNew(widget.getWhatsNew());
        dto.setMoreInfo(widget.getMoreInfo());
        dto.setScreenshotUrls(widget.getScreenshotUrls() != null ? widget.getScreenshotUrls() : new ArrayList<>());
        dto.setDownloads(widget.getDownloads());
        dto.setSizeBytes(widget.getSizeBytes());
        dto.setAverageRating(widget.getAverageRating());
        dto.setRatingCount(widget.getRatingCount());
        dto.setCommentCount(widget.getCommentCount());
        return dto;
    }

    public Widget toEntity(WidgetDTO dto) {
        Widget widget = new Widget();
        widget.setName(dto.getName());
        widget.setDescription(dto.getDescription());
        widget.setCategory(dto.getCategory());
        widget.setIconUrl(dto.getIconUrl());
        widget.setFileUrl(dto.getFileUrl());
        widget.setImageHint(dto.getImageHint());

        if (dto.getTags() != null) {
            widget.setTags(new ArrayList<>(dto.getTags()));
        }
        if (dto.getKeyFeatures() != null) {
            widget.setKeyFeatures(new ArrayList<>(dto.getKeyFeatures()));
        }

        widget.setWhatsNew(dto.getWhatsNew());
        widget.setMoreInfo(dto.getMoreInfo());

        if (dto.getScreenshotUrls() != null) {
            widget.setScreenshotUrls(new ArrayList<>(dto.getScreenshotUrls()));
        }

        widget.setDownloads(dto.getDownloads() != null ? dto.getDownloads() : 0);
        widget.setSizeBytes(dto.getSizeBytes());

        return widget;
    }

    public void updateEntityFromDto(Widget widget, WidgetDTO dto) {
        widget.setName(dto.getName());
        widget.setDescription(dto.getDescription());
        widget.setCategory(dto.getCategory());
        widget.setIconUrl(dto.getIconUrl());
        widget.setFileUrl(dto.getFileUrl());
        widget.setImageHint(dto.getImageHint());

        if (dto.getTags() != null) {
            widget.getTags().clear();
            widget.getTags().addAll(dto.getTags());
        }

        if (dto.getKeyFeatures() != null) {
            widget.getKeyFeatures().clear();
            widget.getKeyFeatures().addAll(dto.getKeyFeatures());
        }

        widget.setWhatsNew(dto.getWhatsNew());
        widget.setMoreInfo(dto.getMoreInfo());

        if (dto.getScreenshotUrls() != null) {
            widget.getScreenshotUrls().clear();
            widget.getScreenshotUrls().addAll(dto.getScreenshotUrls());
        }

        if (dto.getSizeBytes() != null) {
            widget.setSizeBytes(dto.getSizeBytes());
        }
    }
}
