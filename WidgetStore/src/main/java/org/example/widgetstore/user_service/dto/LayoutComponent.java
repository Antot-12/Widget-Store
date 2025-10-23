package org.example.widgetstore.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LayoutComponent {
    private String api;
    private boolean state = true;
    private Map<String, String> position = new HashMap<>();
    private Map<String, String> style = new HashMap<>();
    private String color = "cyan";
}
