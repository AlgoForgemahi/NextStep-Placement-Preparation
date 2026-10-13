package com.nextstep.repository;
import com.nextstep.entity.Bookmark;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface BookmarkRepository extends JpaRepository<Bookmark,Long>,JpaSpecificationExecutor<Bookmark> {Optional<Bookmark> findByUserIdAndQuestionId(Long userId,Long questionId); List<Bookmark> findByUserId(Long userId);}
