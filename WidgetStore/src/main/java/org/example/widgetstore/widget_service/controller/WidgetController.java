package org.example.widgetstore.widget_service.controller;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.user_service.service.UserDetailsServiceImpl;
import org.example.widgetstore.widget_service.dto.PageResponse;
import org.example.widgetstore.widget_service.dto.WidgetDTO;
import org.example.widgetstore.widget_service.dto.WidgetListDTO;
import org.example.widgetstore.widget_service.dto.InstallWidgetRequest;
import org.example.widgetstore.user_service.service.UserLayoutService;
import org.example.widgetstore.widget_service.service.WidgetService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/widget")
@CrossOrigin(origins = "*")
//@PreAuthorize("hasRole.")
public class WidgetController {

    private final WidgetService widgetService;
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final UserLayoutService userLayoutService;

    @GetMapping
    public PageResponse<WidgetListDTO> getAllWidgets(Pageable pageable) {
        Page<WidgetListDTO> page = widgetService.getAllWidgets(pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }


    @GetMapping("/categ/{category}")
    public PageResponse<WidgetListDTO> getWidgetsByCategory(Pageable pageable, @PathVariable String category) {
        Page<WidgetListDTO> page = widgetService.searchByCategory(category, pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @GetMapping("/{id}")
    public WidgetDTO getWidget(@PathVariable Long id) {
        return widgetService.getWidgetById(id);
    }

    @PostMapping("/create")
    public String createWidget(@RequestBody WidgetDTO widgetDTO, @AuthenticationPrincipal UserDetails userCred) {
        User user = userDetailsServiceImpl.loadUser(userCred.getUsername());
        return widgetService.createWidget(widgetDTO, user).getId().toString();
    }

    @PutMapping("/edit/{id}")
    public void editWidget(@PathVariable Long id, @RequestBody WidgetDTO widgetDTO) {
        widgetService.updateWidget(id, widgetDTO);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteWidget(@PathVariable Long id) {
        widgetService.deleteWidget(id);
    }

    @PostMapping("/add/screens/{id}")
    public void saveScreenshotUrl(@PathVariable Long id, @RequestParam List<String> screenshotUrls) {
        System.out.println("===========================================");
        System.out.println(screenshotUrls);
        System.out.println("===========================================");

        widgetService.saveScreenshotUrl(id, screenshotUrls);
    }

    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return widgetService.getAllCategories();
    }

    @PostMapping("/install/{id}")
    public ResponseEntity<String> installWidget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            // Get the widget to retrieve its API identifier
            WidgetDTO widget = widgetService.getWidgetById(id);
            if (widget == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Widget not found");
            }

            if (widget.getApi() == null || widget.getApi().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Widget does not have an API identifier");
            }

            // Install widget to user's layout
            String userId = userDetails.getUsername();
            userLayoutService.installWidget(userId, widget.getApi());

            return ResponseEntity.ok("Widget installed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unknown widget API");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to install widget");
        }
    }

    @DeleteMapping("/uninstall/{id}")
    public ResponseEntity<String> uninstallWidget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            // Get the widget to retrieve its API identifier
            WidgetDTO widget = widgetService.getWidgetById(id);
            if (widget == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Widget not found");
            }

            if (widget.getApi() == null || widget.getApi().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Widget does not have an API identifier");
            }

            // Uninstall widget from user's layout
            String userId = userDetails.getUsername();
            userLayoutService.uninstallWidget(userId, widget.getApi());

            return ResponseEntity.ok("Widget uninstalled successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to uninstall widget");
        }
    }


}
