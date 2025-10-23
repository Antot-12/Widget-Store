package org.example.widgetstore.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LayoutConfig {
    private String templateName = "Default Morning";
    private List<LayoutComponent> components = new ArrayList<>();
}
