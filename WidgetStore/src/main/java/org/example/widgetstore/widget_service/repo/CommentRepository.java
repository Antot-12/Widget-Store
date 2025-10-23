package org.example.widgetstore.widget_service.repo;

import org.example.widgetstore.widget_service.entity.Comment;
import org.example.widgetstore.widget_service.entity.Widget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByWidgetOrderByCreatedAtDesc(Widget widget, Pageable pageable);
    long countByWidget(Widget widget);
}
