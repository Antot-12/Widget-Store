package org.example.widgetstore.user_service.service;

import org.example.widgetstore.user_service.dto.LayoutComponent;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class WidgetDefaultsRegistry {

    private final Map<String, LayoutComponent> defaults = new HashMap<>();

    public WidgetDefaultsRegistry() {
        initializeDefaults();
    }

    private void initializeDefaults() {
        // Clock widget
        LayoutComponent clock = new LayoutComponent();
        clock.setApi("clock");
        clock.setState(true);
        clock.setPosition(Map.of("top", "20px", "right", "20px"));
        clock.setStyle(Map.of("fontSize", "4rem", "fontWeight", "bold"));
        clock.setColor("cyan");
        defaults.put("clock", clock);

        // Weather widget
        LayoutComponent weather = new LayoutComponent();
        weather.setApi("weather");
        weather.setState(true);
        weather.setPosition(Map.of("top", "20px", "left", "20px"));
        weather.setStyle(Map.of());
        weather.setColor("cyan");
        defaults.put("weather", weather);

        // News widget
        LayoutComponent news = new LayoutComponent();
        news.setApi("news");
        news.setState(true);
        news.setPosition(Map.of("bottom", "100px", "left", "20px"));
        news.setStyle(Map.of("fontSize", "1rem", "maxWidth", "400px"));
        news.setColor("cyan");
        defaults.put("news", news);

        // Suggestion widget
        LayoutComponent suggestion = new LayoutComponent();
        suggestion.setApi("suggestion");
        suggestion.setState(true);
        suggestion.setPosition(Map.of("bottom", "bottom", "left", "50%", "transform", "translateX(-50%)"));
        suggestion.setStyle(Map.of("fontSize", "2rem", "fontStyle", "italic"));
        suggestion.setColor("green");
        defaults.put("suggestion", suggestion);

        // Calendar widget
        LayoutComponent calendar = new LayoutComponent();
        calendar.setApi("calendar");
        calendar.setState(true);
        calendar.setPosition(Map.of("bottom", "100px", "right", "20px"));
        calendar.setStyle(Map.of("fontSize", "1.5rem", "maxWidth", "400px"));
        calendar.setColor("cyan");
        defaults.put("calendar", calendar);
    }

    public LayoutComponent getDefaultComponent(String api) {
        LayoutComponent original = defaults.get(api);
        if (original == null) {
            return null;
        }
        
        // Return a deep copy to prevent mutation
        LayoutComponent copy = new LayoutComponent();
        copy.setApi(original.getApi());
        copy.setState(original.isState());
        copy.setPosition(new HashMap<>(original.getPosition()));
        copy.setStyle(new HashMap<>(original.getStyle()));
        copy.setColor(original.getColor());
        return copy;
    }

    public boolean hasDefault(String api) {
        return defaults.containsKey(api);
    }
}
