package com.nextstep.repository;
import com.nextstep.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.*;
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion,Long>,JpaSpecificationExecutor<InterviewQuestion> {}
