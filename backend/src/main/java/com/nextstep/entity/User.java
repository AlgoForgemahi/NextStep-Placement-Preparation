package com.nextstep.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="users") public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public Instant createdAt=Instant.now();
  @Column(name="name", columnDefinition="text") public String name;
  @Column(name="email", columnDefinition="text") public String email;
  @Column(name="password", columnDefinition="text") public String password;
  @Column(name="role", columnDefinition="text") public String role;
  @Column(name="department", columnDefinition="text") public String department;
  @Column(name="target_role", columnDefinition="text") public String targetRole;
  @Column(name="daily_goal") public Integer dailyGoal;
}
