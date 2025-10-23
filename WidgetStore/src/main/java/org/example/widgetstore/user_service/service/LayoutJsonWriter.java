package org.example.widgetstore.user_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.widgetstore.user_service.dto.LayoutComponent;
import org.example.widgetstore.user_service.dto.LayoutConfig;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Custom JSON writer for layout files.
 * Produces JSON with specific formatting:
 * - Root object: pretty-printed
 * - Component objects: pretty-printed
 * - Nested objects (position, style): compact (single line)
 */
@Component
public class LayoutJsonWriter {

    private final ObjectMapper compactMapper;

    public LayoutJsonWriter() {
        this.compactMapper = new ObjectMapper();
        // No pretty printer - for compact output
    }

    /**
     * Converts LayoutConfig to JSON string with custom formatting.
     *
     * Format:
     * {
     *   "templateName": "value",
     *   "components": [
     *     {
     *       "api": "value",
     *       "state": true,
     *       "position": { "key": "value" },
     *       "style": { "key": "value" },
     *       "color": "value"
     *     }
     *   ]
     * }
     */
    public String write(LayoutConfig layout) throws JsonProcessingException {
        StringBuilder sb = new StringBuilder();

        sb.append("{\n");
        sb.append("  \"templateName\": \"").append(escapeJson(layout.getTemplateName())).append("\",\n");
        sb.append("  \"components\": [\n");

        int componentCount = layout.getComponents().size();
        for (int i = 0; i < componentCount; i++) {
            LayoutComponent component = layout.getComponents().get(i);
            sb.append("    {\n");
            sb.append("      \"api\": \"").append(escapeJson(component.getApi())).append("\",\n");
            sb.append("      \"state\": ").append(component.isState()).append(",\n");

            // Position - compact on one line
            sb.append("      \"position\": ");
            sb.append(mapToCompactJson(component.getPosition()));
            sb.append(",\n");

            // Style - compact on one line
            sb.append("      \"style\": ");
            sb.append(mapToCompactJson(component.getStyle()));
            sb.append(",\n");

            sb.append("      \"color\": \"").append(escapeJson(component.getColor())).append("\"\n");
            sb.append("    }");

            if (i < componentCount - 1) {
                sb.append(",");
            }
            sb.append("\n");
        }

        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }

    /**
     * Converts a map to compact JSON format (single line).
     * Example: { "key1": "value1", "key2": "value2" }
     */
    private String mapToCompactJson(Map<String, String> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("{ ");

        int count = 0;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (count > 0) {
                sb.append(", ");
            }

            sb.append("\"").append(escapeJson(entry.getKey())).append("\": ");

            String value = entry.getValue();
            // Check if value is a number
            if (isNumeric(value)) {
                sb.append(value);
            } else {
                sb.append("\"").append(escapeJson(value)).append("\"");
            }

            count++;
        }

        sb.append(" }");
        return sb.toString();
    }

    /**
     * Check if a string is a numeric value.
     */
    private boolean isNumeric(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Escape special characters in JSON strings.
     */
    private String escapeJson(String str) {
        if (str == null) {
            return "";
        }

        return str
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
