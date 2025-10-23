package org.example.widgetstore.widget_service.controller;

import lombok.RequiredArgsConstructor;
import org.example.widgetstore.widget_service.dto.CommentDTO;
import org.example.widgetstore.widget_service.dto.CreateCommentRequest;
import org.example.widgetstore.widget_service.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/widget/{widgetId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<Page<CommentDTO>> getComments(
            @PathVariable Long widgetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(commentService.getCommentsByWidget(widgetId, page, size));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long widgetId,
            @RequestBody CreateCommentRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(commentService.createComment(widgetId, request, auth));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long widgetId,
            @PathVariable Long commentId,
            @RequestBody CreateCommentRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request, auth));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long widgetId,
            @PathVariable Long commentId,
            Authentication auth
    ) {
        commentService.deleteComment(commentId, auth);
        return ResponseEntity.noContent().build();
    }
}
