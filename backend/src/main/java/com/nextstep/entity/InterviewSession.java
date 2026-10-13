package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="interview_sessions") public class InterviewSession {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="user_id") public Long userId;
  @Column(name="role", columnDefinition="text") public String role;
  @Column(name="category", columnDefinition="text") public String category;
  @Column(name="status", columnDefinition="text") public String status;
  @Column(name="duration_seconds") public Integer durationSeconds;
  @Column(name="elapsed_seconds") public Integer elapsedSeconds;
  @Column(name="questions", columnDefinition="text") public String questions;
  @Column(name="answers", columnDefinition="text") public String answers;
  @Column(name="score") public Integer score;
}
