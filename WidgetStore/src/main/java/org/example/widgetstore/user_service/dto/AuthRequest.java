package org.example.widgetstore.user_service.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
    private String email;
}
