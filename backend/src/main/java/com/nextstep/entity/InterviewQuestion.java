package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="interview_questions") public class InterviewQuestion {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="category", columnDefinition="text") public String category;
  @Column(name="role", columnDefinition="text") public String role;
  @Column(name="prompt", columnDefinition="text") public String prompt;
  @Column(name="model_answer", columnDefinition="text") public String modelAnswer;
  @Column(name="key_points", columnDefinition="text") public String keyPoints;
}
