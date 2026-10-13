package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="learning_goals") public class LearningGoal {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="user_id") public Long userId;
  @Column(name="title", columnDefinition="text") public String title;
  @Column(name="due_date", columnDefinition="text") public String dueDate;
  @Column(name="completed") public Boolean completed;
}
