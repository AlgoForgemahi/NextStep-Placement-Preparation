package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="bookmarks") public class Bookmark {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="user_id") public Long userId;
  @Column(name="question_id") public Long questionId;
}
