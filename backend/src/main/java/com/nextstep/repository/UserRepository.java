package com.nextstep.repository;
import com.nextstep.entity.User;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface UserRepository extends JpaRepository<User,Long>,JpaSpecificationExecutor<User> {Optional<User> findByEmail(String email);}
