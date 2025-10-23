package org.example.widgetstore.widget_service.repo;

import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.widget_service.entity.Rating;
import org.example.widgetstore.widget_service.entity.Widget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByWidgetAndUser(Widget widget, User user);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.widget = :widget")
    Double getAverageRatingForWidget(@Param("widget") Widget widget);

    long countByWidget(Widget widget);
}
