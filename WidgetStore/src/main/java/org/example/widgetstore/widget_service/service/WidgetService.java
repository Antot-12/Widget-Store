package org.example.widgetstore.widget_service.service;

import lombok.RequiredArgsConstructor;
import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.widget_service.dto.WidgetDTO;
import org.example.widgetstore.widget_service.dto.WidgetListDTO;
import org.example.widgetstore.widget_service.dto.WidgetMapper;
import org.example.widgetstore.widget_service.entity.Widget;
import org.example.widgetstore.widget_service.repo.WidgetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WidgetService {

    private final WidgetRepository widgetRepository;
    private final WidgetMapper widgetMapper;


    public Page<WidgetListDTO> getAllWidgets(Pageable pageable) {
        return widgetRepository.findAll(pageable)
                .map(widgetMapper::toListDto);
    }

    public Page<WidgetListDTO> searchByCategory(String part, Pageable pageable) {
        return widgetRepository
                .findByCategoryInIgnoreCase(part, pageable)
                .map(widgetMapper::toListDto);
    }



    public List<String> getAllCategories() {
        // Get distinct categories from database
        List<String> categories = widgetRepository.findAll().stream()
                .map(Widget::getCategory)
                .filter(category -> category != null && !category.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        // If no categories in database, return default list
        if (categories.isEmpty()) {
            categories = new ArrayList<>(List.of(
                    "Productivity", "Social", "Weather",
                    "Music", "Health", "Utilities"));
        }

        return categories;
    }



    public WidgetDTO getWidgetById(Long id) {
        return widgetMapper.toDto(widgetRepository.getReferenceById(id));
    }

    public Widget createWidget(WidgetDTO dto, User user) {
        Widget widget = widgetMapper.toEntity(dto);
        widget.setCreatedBy(user);
        return widgetRepository.save(widget);
    }


    public Optional<Widget> updateWidget(Long id, WidgetDTO dto) {
        return widgetRepository.findById(id).map(existing -> {
            widgetMapper.updateEntityFromDto(existing, dto);
            return widgetRepository.save(existing);
        });
    }

    public boolean deleteWidget(Long id) {
        return widgetRepository.findById(id).map(widget -> {
            widgetRepository.delete(widget);
            return true;
        }).orElse(false);
    }

    public boolean saveScreenshotUrl(Long id, List<String> urls) {
        Widget widget = widgetRepository.findById(id).orElse(null);
        if (widget == null) {
            System.out.println("===========================================");
            System.out.println("           FUCKING Widget NULL             ");
            System.out.println("===========================================");

            return false;
        }
        widget.getScreenshotUrls().addAll(urls);
        widgetRepository.save(widget);
        return true;
    }

}
