package com.nextstep.repository;
import com.nextstep.entity.LearningGoal;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface LearningGoalRepository extends JpaRepository<LearningGoal,Long>,JpaSpecificationExecutor<LearningGoal> {List<LearningGoal> findByUserIdOrderByCreatedAtDesc(Long userId);}
