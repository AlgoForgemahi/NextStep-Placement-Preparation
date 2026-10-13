package com.nextstep.web;
import com.nextstep.entity.*;import com.nextstep.repository.*;import com.nextstep.service.*;
import java.util.*;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/coding") public class CodingController {
 final CodingProblemRepository problems;final CodingSubmissionRepository submissions;final ExecutionService executor;final JsonService json;
 public CodingController(CodingProblemRepository problems,CodingSubmissionRepository submissions,ExecutionService executor,JsonService json){this.problems=problems;this.submissions=submissions;this.executor=executor;this.json=json;}
 record Code(@NotBlank @Size(max=50000) String code,@Pattern(regexp="Python|Java|C|C\\+\\+") String language){}
 @GetMapping Object list(){return Map.of("configured",executor.configured(),"problems",problems.findAll().stream().map(p->Map.of("id",p.id,"title",p.title,"topic",p.topic,"difficulty",p.difficulty)).toList(),"submissions",submissions.findByUserIdOrderByCreatedAtDesc(AuthController.uid()));}
 @GetMapping("/{id}") Object problem(@PathVariable long id){var p=problems.findById(id).orElseThrow(()->Errors.bad("Problem not found."));return Map.of("id",p.id,"title",p.title,"topic",p.topic,"difficulty",p.difficulty,"description",p.description,"constraints",p.constraintsText,"sample",json.read(p.tests).get(0),"hints",json.read(p.hints),"solution",p.solution,"complexity",p.complexity);}
 @PostMapping("/{id}/{action}") Object execute(@PathVariable long id,@PathVariable String action,@Valid @RequestBody Code c){if(!List.of("run","submit").contains(action))throw Errors.bad("Invalid action.");var p=problems.findById(id).orElseThrow(()->Errors.bad("Problem not found."));var result=executor.execute(c.code(),c.language(),json.read(p.tests),action.equals("run"));if(action.equals("submit")){var s=new CodingSubmission();s.userId=AuthController.uid();s.problemId=id;s.code=c.code();s.language=c.language();s.status=result.get("status").equals("NOT_CONFIGURED")?"SAVED_UNGRADED":result.get("status").toString();s.details=json.write(result);submissions.save(s);}return result;}
}
