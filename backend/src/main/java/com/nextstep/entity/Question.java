package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="questions") public class Question {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="kind", columnDefinition="text") public String kind;
  @Column(name="topic", columnDefinition="text") public String topic;
  @Column(name="difficulty", columnDefinition="text") public String difficulty;
  @Column(name="prompt", columnDefinition="text") public String prompt;
  @Column(name="options", columnDefinition="text") public String options;
  @Column(name="answer") public Integer answer;
  @Column(name="explanation", columnDefinition="text") public String explanation;
}
