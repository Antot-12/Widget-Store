package org.example.widgetstore.user_service.repo;

import org.example.widgetstore.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
//    Optional<User> save(String username);
    Optional<User> findByUsername(String username);

}

