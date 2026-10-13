package com.nextstep.repository;
import com.nextstep.entity.ResumeReview;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface ResumeReviewRepository extends JpaRepository<ResumeReview,Long>,JpaSpecificationExecutor<ResumeReview> {List<ResumeReview> findByUserIdOrderByCreatedAtDesc(Long userId);}
