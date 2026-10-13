package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="quiz_attempts") public class QuizAttempt {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="user_id") public Long userId;
  @Column(name="kind", columnDefinition="text") public String kind;
  @Column(name="status", columnDefinition="text") public String status;
  @Column(name="question_ids", columnDefinition="text") public String questionIds;
  @Column(name="answers", columnDefinition="text") public String answers;
  @Column(name="score") public Integer score;
  @Column(name="total") public Integer total;
  @Column(name="duration_seconds") public Integer durationSeconds;
  @Column(name="elapsed_seconds") public Integer elapsedSeconds;
  @Column(name="details", columnDefinition="text") public String details;
}
