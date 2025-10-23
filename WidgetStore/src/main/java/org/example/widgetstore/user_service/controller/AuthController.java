package org.example.widgetstore.user_service.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.widgetstore.user_service.dto.AuthRequest;
import org.example.widgetstore.user_service.dto.AuthResponse;
import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.user_service.repo.UserRepository;
import org.example.widgetstore.user_service.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public String register(@RequestBody AuthRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Username is already in use";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add("GUEST");

        userRepository.save(user);

        return "Successfully registered";
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            String token = jwtUtil.generateToken(user.getUsername(), user.getRoles());
            return ResponseEntity.ok(new AuthResponse(token));

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }





}


