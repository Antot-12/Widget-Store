package org.example.widgetstore.user_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.widgetstore.user_service.dto.LayoutComponent;
import org.example.widgetstore.user_service.dto.LayoutConfig;
import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.user_service.repo.UserRepository;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserLayoutService {

    private final ObjectMapper objectMapper;
    private final WidgetDefaultsRegistry widgetDefaultsRegistry;
    private final UserRepository userRepository;
    private final LayoutJsonWriter layoutJsonWriter;

    @org.springframework.beans.factory.annotation.Value("${user.layout.storage.path:data/users}")
    private String dataBasePath;

    private final Map<String, ReentrantReadWriteLock> fileLocks = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Ensure data directory exists
        try {
            Files.createDirectories(Paths.get(dataBasePath));
            log.info("User layouts storage directory initialized at: {}", dataBasePath);
        } catch (IOException e) {
            log.error("Failed to create storage directory", e);
            throw new RuntimeException("Failed to initialize storage directory", e);
        }

        // Initialize layouts for all existing users
        initializeLayoutsForAllUsers();
    }

    /**
     * Initialize layout files for all existing users who don't have one.
     * This runs on application startup.
     */
    private void initializeLayoutsForAllUsers() {
        try {
            List<User> allUsers = userRepository.findAll();
            int initializedCount = 0;

            log.info("Checking layout files for {} users...", allUsers.size());

            for (User user : allUsers) {
                String userId = user.getUsername();

                try {
                    File layoutFile = getLayoutFile(userId);

                    if (!layoutFile.exists()) {
                        // Create default layout for this user
                        LayoutConfig defaultLayout = createDefaultLayout();
                        saveLayout(userId, defaultLayout);
                        initializedCount++;
                        log.info("Created default layout for user: {}", userId);
                    }
                } catch (Exception e) {
                    log.error("Failed to initialize layout for user: {}", userId, e);
                    // Continue with other users even if one fails
                }
            }

            if (initializedCount > 0) {
                log.info("Initialized layout files for {} users", initializedCount);
            } else {
                log.info("All users already have layout files");
            }
        } catch (Exception e) {
            log.error("Error during layout initialization process", e);
            // Don't throw - allow application to start even if initialization fails
        }
    }

    public LayoutConfig getLayout(String userId) {
        validateUserId(userId);
        
        File layoutFile = getLayoutFile(userId);
        ReentrantReadWriteLock lock = getFileLock(userId);
        
        lock.readLock().lock();
        try {
            if (!layoutFile.exists()) {
                // Need to create default layout
                lock.readLock().unlock();
                lock.writeLock().lock();
                try {
                    // Double-check after acquiring write lock
                    if (!layoutFile.exists()) {
                        LayoutConfig defaultLayout = createDefaultLayout();
                        saveLayout(userId, defaultLayout);
                        return defaultLayout;
                    }
                    // File was created by another thread, read it
                    lock.writeLock().unlock();
                    lock.readLock().lock();
                } catch (Exception e) {
                    lock.writeLock().unlock();
                    throw e;
                }
            }
            
            return objectMapper.readValue(layoutFile, LayoutConfig.class);
        } catch (IOException e) {
            log.error("Failed to read layout for user: {}", userId, e);
            throw new RuntimeException("Failed to read user layout", e);
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Install a widget into user's layout.
     * If component with same api exists: merge (update state/position/style/color with provided values).
     * Otherwise append new component.
     *
     * @param userId User ID
     * @param api Widget API identifier
     * @param defaults Default values (position, style, color) - optional
     * @param overrides Override values to merge - optional
     * @return Updated layout configuration
     */
    public LayoutConfig installWidget(String userId, String api, LayoutComponent defaults, LayoutComponent overrides) {
        validateUserId(userId);

        if (api == null || api.trim().isEmpty()) {
            throw new IllegalArgumentException("Widget API cannot be null or empty");
        }

        ReentrantReadWriteLock lock = getFileLock(userId);
        lock.writeLock().lock();
        try {
            LayoutConfig layout = getLayoutInternal(userId);

            // Find existing component with same api
            LayoutComponent existingComponent = layout.getComponents().stream()
                    .filter(c -> api.equals(c.getApi()))
                    .findFirst()
                    .orElse(null);

            if (existingComponent != null) {
                // Component exists - merge overrides
                if (overrides != null) {
                    mergeComponent(existingComponent, overrides);
                }
                log.info("Updated existing widget {} in user {} layout", api, userId);
            } else {
                // Component doesn't exist - create new one
                LayoutComponent newComponent = new LayoutComponent();
                newComponent.setApi(api);
                newComponent.setState(true);

                // Use defaults if provided, otherwise registry defaults, otherwise empty
                if (defaults != null) {
                    newComponent.setPosition(defaults.getPosition() != null ? new HashMap<>(defaults.getPosition()) : new HashMap<>());
                    newComponent.setStyle(defaults.getStyle() != null ? new HashMap<>(defaults.getStyle()) : new HashMap<>());
                    newComponent.setColor(defaults.getColor() != null ? defaults.getColor() : "cyan");
                } else {
                    LayoutComponent registryDefault = widgetDefaultsRegistry.getDefaultComponent(api);
                    if (registryDefault != null) {
                        newComponent.setPosition(new HashMap<>(registryDefault.getPosition()));
                        newComponent.setStyle(new HashMap<>(registryDefault.getStyle()));
                        newComponent.setColor(registryDefault.getColor());
                    } else {
                        newComponent.setPosition(new HashMap<>());
                        newComponent.setStyle(new HashMap<>());
                        newComponent.setColor("cyan");
                    }
                }

                // Apply overrides to new component
                if (overrides != null) {
                    mergeComponent(newComponent, overrides);
                }

                layout.getComponents().add(newComponent);
                log.info("Added new widget {} to user {} layout", api, userId);
            }

            saveLayout(userId, layout);
            return layout;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Install a widget with only defaults (backward compatibility).
     */
    public LayoutConfig installWidget(String userId, String api) {
        return installWidget(userId, api, null, null);
    }

    /**
     * Uninstall a widget from user's layout.
     * Removes component with the specified api.
     *
     * @param userId User ID
     * @param api Widget API identifier
     * @return Updated layout configuration
     */
    public LayoutConfig uninstallWidget(String userId, String api) {
        validateUserId(userId);

        if (api == null || api.trim().isEmpty()) {
            throw new IllegalArgumentException("Widget API cannot be null or empty");
        }

        ReentrantReadWriteLock lock = getFileLock(userId);
        lock.writeLock().lock();
        try {
            LayoutConfig layout = getLayoutInternal(userId);

            boolean removed = layout.getComponents().removeIf(c -> api.equals(c.getApi()));

            if (removed) {
                saveLayout(userId, layout);
                log.info("Uninstalled widget {} from user {} layout", api, userId);
            } else {
                log.warn("Widget {} not found in user {} layout", api, userId);
            }

            return layout;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Update a specific component in user's layout.
     * Deep-merges the patchObject into the existing component.
     *
     * @param userId User ID
     * @param api Widget API identifier
     * @param patchObject Component properties to merge
     * @return Updated layout configuration
     */
    public LayoutConfig updateComponent(String userId, String api, LayoutComponent patchObject) {
        validateUserId(userId);

        if (api == null || api.trim().isEmpty()) {
            throw new IllegalArgumentException("Widget API cannot be null or empty");
        }

        if (patchObject == null) {
            throw new IllegalArgumentException("Patch object cannot be null");
        }

        ReentrantReadWriteLock lock = getFileLock(userId);
        lock.writeLock().lock();
        try {
            LayoutConfig layout = getLayoutInternal(userId);

            LayoutComponent existingComponent = layout.getComponents().stream()
                    .filter(c -> api.equals(c.getApi()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Widget " + api + " not found in layout"));

            mergeComponent(existingComponent, patchObject);

            saveLayout(userId, layout);
            log.info("Updated component {} for user {}", api, userId);

            return layout;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Set the template name for user's layout.
     *
     * @param userId User ID
     * @param templateName Template name
     * @return Updated layout configuration
     */
    public LayoutConfig setTemplateName(String userId, String templateName) {
        validateUserId(userId);

        if (templateName == null || templateName.trim().isEmpty()) {
            throw new IllegalArgumentException("Template name cannot be null or empty");
        }

        ReentrantReadWriteLock lock = getFileLock(userId);
        lock.writeLock().lock();
        try {
            LayoutConfig layout = getLayoutInternal(userId);
            layout.setTemplateName(templateName);

            saveLayout(userId, layout);
            log.info("Set template name to '{}' for user {}", templateName, userId);

            return layout;
        } finally {
            lock.writeLock().unlock();
        }
    }

    private LayoutConfig getLayoutInternal(String userId) {
        File layoutFile = getLayoutFile(userId);

        if (!layoutFile.exists()) {
            LayoutConfig defaultLayout = createDefaultLayout();
            try {
                // Use custom JSON writer for consistent formatting
                String json = layoutJsonWriter.write(defaultLayout);
                Files.writeString(layoutFile.toPath(), json);
            } catch (IOException e) {
                log.error("Failed to create default layout for user: {}", userId, e);
                throw new RuntimeException("Failed to create default layout", e);
            }
            return defaultLayout;
        }

        try {
            return objectMapper.readValue(layoutFile, LayoutConfig.class);
        } catch (IOException e) {
            log.error("Failed to read layout for user: {}", userId, e);
            throw new RuntimeException("Failed to read user layout", e);
        }
    }

    private void saveLayout(String userId, LayoutConfig layout) {
        File layoutFile = getLayoutFile(userId);
        File tempFile = new File(layoutFile.getAbsolutePath() + ".tmp");

        try {
            // Write to temp file first using custom JSON writer
            String json = layoutJsonWriter.write(layout);
            Files.writeString(tempFile.toPath(), json);

            // Atomically move temp file to actual file
            Files.move(tempFile.toPath(), layoutFile.toPath(), StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);

            log.debug("Saved layout for user: {}", userId);
        } catch (IOException e) {
            log.error("Failed to save layout for user: {}", userId, e);
            // Clean up temp file if it exists
            tempFile.delete();
            throw new RuntimeException("Failed to save user layout", e);
        }
    }

    private File getLayoutFile(String userId) {
        Path userDir = Paths.get(dataBasePath, userId);
        try {
            Files.createDirectories(userDir);
        } catch (IOException e) {
            log.error("Failed to create user directory: {}", userId, e);
            throw new RuntimeException("Failed to create user directory", e);
        }
        return userDir.resolve("layout.json").toFile();
    }

    private ReentrantReadWriteLock getFileLock(String userId) {
        return fileLocks.computeIfAbsent(userId, k -> new ReentrantReadWriteLock());
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        // Prevent path traversal attacks
        if (userId.contains("..") || userId.contains("/") || userId.contains("\\")) {
            throw new IllegalArgumentException("Invalid user ID format");
        }
    }

    /**
     * Deep-merge patch object into target component.
     * Updates state, position, style, and color if provided in patch.
     */
    private void mergeComponent(LayoutComponent target, LayoutComponent patch) {
        if (patch == null) {
            return;
        }

        // Don't merge api field - it's the identifier

        // Merge state - only if explicitly set in patch
        // Since boolean primitive can't be null, we need a way to check if it was set
        // For now, we'll always merge the state value
        target.setState(patch.isState());

        // Deep merge position map
        if (patch.getPosition() != null) {
            if (target.getPosition() == null) {
                target.setPosition(new HashMap<>());
            }
            target.getPosition().putAll(patch.getPosition());
        }

        // Deep merge style map
        if (patch.getStyle() != null) {
            if (target.getStyle() == null) {
                target.setStyle(new HashMap<>());
            }
            target.getStyle().putAll(patch.getStyle());
        }

        // Merge color
        if (patch.getColor() != null && !patch.getColor().trim().isEmpty()) {
            target.setColor(patch.getColor());
        }
    }

    private LayoutConfig createDefaultLayout() {
        LayoutConfig layout = new LayoutConfig();
        layout.setTemplateName("Default Morning");
        
        List<LayoutComponent> defaultComponents = new ArrayList<>();
        
        // Add all default widgets
        for (String api : List.of("clock", "weather", "news", "suggestion", "calendar")) {
            LayoutComponent component = widgetDefaultsRegistry.getDefaultComponent(api);
            if (component != null) {
                defaultComponents.add(component);
            }
        }
        
        layout.setComponents(defaultComponents);
        return layout;
    }
}
