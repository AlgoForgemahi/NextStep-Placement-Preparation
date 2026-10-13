package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="resume_reviews") public class ResumeReview {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="user_id") public Long userId;
  @Column(name="filename", columnDefinition="text") public String filename;
  @Column(name="target_role", columnDefinition="text") public String targetRole;
  @Column(name="score") public Integer score;
  @Column(name="report", columnDefinition="text") public String report;
}
