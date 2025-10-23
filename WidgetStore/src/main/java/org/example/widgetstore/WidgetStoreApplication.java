package org.example.widgetstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "org.example.widgetstore.user_service",
        "org.example.widgetstore.widget_service"
})
public class WidgetStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(WidgetStoreApplication.class, args);
    }

}
