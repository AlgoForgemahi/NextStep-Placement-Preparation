package com.nextstep.repository;
import com.nextstep.entity.InterviewSession;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface InterviewSessionRepository extends JpaRepository<InterviewSession,Long>,JpaSpecificationExecutor<InterviewSession> {List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);}
