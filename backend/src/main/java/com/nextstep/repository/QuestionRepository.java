package com.nextstep.repository;
import com.nextstep.entity.Question;
import org.springframework.data.jpa.repository.*;
public interface QuestionRepository extends JpaRepository<Question,Long>,JpaSpecificationExecutor<Question> {}
