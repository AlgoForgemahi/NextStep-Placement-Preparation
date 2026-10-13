package com.nextstep.repository;
import com.nextstep.entity.CodingProblem;
import org.springframework.data.jpa.repository.*;
public interface CodingProblemRepository extends JpaRepository<CodingProblem,Long>,JpaSpecificationExecutor<CodingProblem> {}
