package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="coding_submissions") public class CodingSubmission {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="user_id") public Long userId;
  @Column(name="problem_id") public Long problemId;
  @Column(name="language", columnDefinition="text") public String language;
  @Column(name="code", columnDefinition="text") public String code;
  @Column(name="status", columnDefinition="text") public String status;
  @Column(name="details", columnDefinition="text") public String details;
}
