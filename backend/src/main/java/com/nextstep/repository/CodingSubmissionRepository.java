package com.nextstep.repository;
import com.nextstep.entity.CodingSubmission;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission,Long>,JpaSpecificationExecutor<CodingSubmission> {List<CodingSubmission> findByUserIdOrderByCreatedAtDesc(Long userId);}
