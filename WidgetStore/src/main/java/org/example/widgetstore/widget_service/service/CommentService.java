package org.example.widgetstore.widget_service.service;

import lombok.RequiredArgsConstructor;
import org.example.widgetstore.user_service.entity.User;
import org.example.widgetstore.user_service.repo.UserRepository;
import org.example.widgetstore.widget_service.dto.CommentDTO;
import org.example.widgetstore.widget_service.dto.CreateCommentRequest;
import org.example.widgetstore.widget_service.entity.Comment;
import org.example.widgetstore.widget_service.entity.Widget;
import org.example.widgetstore.widget_service.repo.CommentRepository;
import org.example.widgetstore.widget_service.repo.WidgetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final WidgetRepository widgetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<CommentDTO> getCommentsByWidget(Long widgetId, int page, int size) {
        Widget widget = widgetRepository.findById(widgetId)
                .orElseThrow(() -> new RuntimeException("Widget not found"));

        Page<Comment> comments = commentRepository.findByWidgetOrderByCreatedAtDesc(
                widget,
                PageRequest.of(page, size)
        );

        return comments.map(this::toDTO);
    }

    @Transactional
    public CommentDTO createComment(Long widgetId, CreateCommentRequest request, Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Widget widget = widgetRepository.findById(widgetId)
                .orElseThrow(() -> new RuntimeException("Widget not found"));

        Comment comment = new Comment();
        comment.setWidget(widget);
        comment.setUser(user);
        comment.setContent(request.getContent());

        Comment savedComment = commentRepository.save(comment);

        // Update comment count
        widget.setCommentCount(widget.getCommentCount() + 1);
        widgetRepository.save(widget);

        return toDTO(savedComment);
    }

    @Transactional
    public CommentDTO updateComment(Long commentId, CreateCommentRequest request, Authentication auth) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String username = auth.getName();
        if (!comment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        Comment updatedComment = commentRepository.save(comment);

        return toDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, Authentication auth) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String username = auth.getName();
        if (!comment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        Widget widget = comment.getWidget();
        commentRepository.delete(comment);

        // Update comment count
        widget.setCommentCount(Math.max(0, widget.getCommentCount() - 1));
        widgetRepository.save(widget);
    }

    private CommentDTO toDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setWidgetId(comment.getWidget().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}
