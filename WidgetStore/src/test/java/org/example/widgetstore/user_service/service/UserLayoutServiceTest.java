package org.example.widgetstore.user_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.widgetstore.user_service.dto.LayoutConfig;
import org.example.widgetstore.user_service.dto.LayoutComponent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class UserLayoutServiceTest {

    @Autowired
    private UserLayoutService userLayoutService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @TempDir
    Path tempDir;
    
    @BeforeEach
    void setup() {
        // Override the storage path to use temp directory for tests
        ReflectionTestUtils.setField(userLayoutService, "STORAGE_BASE_PATH", 
            tempDir.toString() + "/user-layouts");
        userLayoutService.init();
    }
    
    @Test
    void testCreateDefaultLayoutOnFirstAccess() {
        String userId = "testuser1";
        
        LayoutConfig layout = userLayoutService.getLayout(userId);
        
        assertNotNull(layout);
        assertEquals("Default Morning", layout.getTemplateName());
        assertEquals(5, layout.getComponents().size());
        
        // Verify all default widgets are present
        assertTrue(hasComponent(layout, "clock"));
        assertTrue(hasComponent(layout, "weather"));
        assertTrue(hasComponent(layout, "news"));
        assertTrue(hasComponent(layout, "suggestion"));
        assertTrue(hasComponent(layout, "calendar"));
    }
    
    @Test
    void testAddComponentIfMissing() {
        String userId = "testuser2";
        
        // First, create an empty layout
        LayoutConfig emptyLayout = new LayoutConfig();
        emptyLayout.setTemplateName("Empty");
        File layoutFile = new File(tempDir.toString() + "/user-layouts/" + userId + ".json");
        layoutFile.getParentFile().mkdirs();
        
        try {
            objectMapper.writeValue(layoutFile, emptyLayout);
        } catch (Exception e) {
            fail("Failed to create test layout: " + e.getMessage());
        }
        
        // Add clock widget
        LayoutConfig updatedLayout = userLayoutService.addComponentIfMissing(userId, "clock");
        
        assertNotNull(updatedLayout);
        assertEquals(1, updatedLayout.getComponents().size());
        assertTrue(hasComponent(updatedLayout, "clock"));
        
        // Try adding clock again - should not duplicate
        LayoutConfig sameLayout = userLayoutService.addComponentIfMissing(userId, "clock");
        assertEquals(1, sameLayout.getComponents().size());
    }
    
    @Test
    void testNoDuplicateEntries() {
        String userId = "testuser3";
        
        // Add clock widget multiple times
        userLayoutService.addComponentIfMissing(userId, "clock");
        userLayoutService.addComponentIfMissing(userId, "clock");
        userLayoutService.addComponentIfMissing(userId, "clock");
        
        LayoutConfig layout = userLayoutService.getLayout(userId);
        
        // Count clock components
        long clockCount = layout.getComponents().stream()
            .filter(c -> "clock".equals(c.getApi()))
            .count();
        
        assertEquals(1, clockCount, "Should have only one clock component");
    }
    
    @Test
    void testRemoveComponent() {
        String userId = "testuser4";
        
        // Get default layout (has all widgets)
        LayoutConfig layout = userLayoutService.getLayout(userId);
        assertEquals(5, layout.getComponents().size());
        
        // Remove clock
        LayoutConfig updatedLayout = userLayoutService.removeComponent(userId, "clock");
        
        assertEquals(4, updatedLayout.getComponents().size());
        assertFalse(hasComponent(updatedLayout, "clock"));
        assertTrue(hasComponent(updatedLayout, "weather"));
    }
    
    @Test
    void testUnknownWidgetApi() {
        String userId = "testuser5";
        
        assertThrows(IllegalArgumentException.class, () -> {
            userLayoutService.addComponentIfMissing(userId, "unknown-widget");
        });
    }
    
    @Test
    void testSeparateUserFiles() {
        String userA = "userA";
        String userB = "userB";
        
        // User A removes clock
        userLayoutService.removeComponent(userA, "clock");
        
        // User B should still have clock
        LayoutConfig layoutA = userLayoutService.getLayout(userA);
        LayoutConfig layoutB = userLayoutService.getLayout(userB);
        
        assertFalse(hasComponent(layoutA, "clock"));
        assertTrue(hasComponent(layoutB, "clock"));
    }
    
    private boolean hasComponent(LayoutConfig layout, String api) {
        return layout.getComponents().stream()
            .anyMatch(c -> api.equals(c.getApi()));
    }
}
