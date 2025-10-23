package org.example.widgetstore.user_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.widgetstore.user_service.dto.AddWidgetToLayoutRequest;
import org.example.widgetstore.user_service.dto.LayoutComponent;
import org.example.widgetstore.user_service.dto.LayoutConfig;
import org.example.widgetstore.user_service.service.UserLayoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/user-layout")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserLayoutController {

    private final UserLayoutService userLayoutService;

    @GetMapping
    public ResponseEntity<LayoutConfig> getUserLayout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String userId = userDetails.getUsername();
        LayoutConfig layout = userLayoutService.getLayout(userId);
        return ResponseEntity.ok(layout);
    }

    @PostMapping("/widget")
    public ResponseEntity<LayoutConfig> addWidgetToLayout(
            @RequestBody AddWidgetToLayoutRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (request.getApi() == null || request.getApi().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            String userId = userDetails.getUsername();
            LayoutConfig updatedLayout = userLayoutService.installWidget(userId, request.getApi());
            return ResponseEntity.ok(updatedLayout);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid widget API requested: {}", request.getApi());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Failed to add widget to layout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/widget/{api}")
    public ResponseEntity<LayoutConfig> removeWidgetFromLayout(
            @PathVariable String api,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String userId = userDetails.getUsername();
            LayoutConfig updatedLayout = userLayoutService.uninstallWidget(userId, api);
            return ResponseEntity.ok(updatedLayout);
        } catch (Exception e) {
            log.error("Failed to remove widget from layout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("/widget/{api}")
    public ResponseEntity<LayoutConfig> updateWidget(
            @PathVariable String api,
            @RequestBody LayoutComponent patchObject,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String userId = userDetails.getUsername();
            LayoutConfig updatedLayout = userLayoutService.updateComponent(userId, api, patchObject);
            return ResponseEntity.ok(updatedLayout);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid update request for widget {}: {}", api, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Failed to update widget in layout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/template-name")
    public ResponseEntity<LayoutConfig> setTemplateName(
            @RequestBody String templateName,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String userId = userDetails.getUsername();
            LayoutConfig updatedLayout = userLayoutService.setTemplateName(userId, templateName);
            return ResponseEntity.ok(updatedLayout);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid template name: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Failed to set template name", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
