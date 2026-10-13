package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="coding_problems") public class CodingProblem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="title", columnDefinition="text") public String title;
  @Column(name="topic", columnDefinition="text") public String topic;
  @Column(name="difficulty", columnDefinition="text") public String difficulty;
  @Column(name="description", columnDefinition="text") public String description;
  @Column(name="constraints_text", columnDefinition="text") public String constraintsText;
  @Column(name="tests", columnDefinition="text") public String tests;
  @Column(name="hints", columnDefinition="text") public String hints;
  @Column(name="solution", columnDefinition="text") public String solution;
  @Column(name="complexity", columnDefinition="text") public String complexity;
}
