package org.example.widgetstore.widget_service.repo;

import org.example.widgetstore.widget_service.entity.Widget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;

public interface WidgetRepository extends JpaRepository<Widget, Long> {

    @Query("select w from Widget w where lower(w.category) in :cats")
    Page<Widget> findByCategoryInIgnoreCase(@Param("cats") String categories, Pageable pageable);
}
