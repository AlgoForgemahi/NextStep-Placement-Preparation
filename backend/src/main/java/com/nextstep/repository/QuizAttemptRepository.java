package com.nextstep.repository;
import com.nextstep.entity.QuizAttempt;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt,Long>,JpaSpecificationExecutor<QuizAttempt> {List<QuizAttempt> findByUserIdOrderByCreatedAtDesc(Long userId);}
