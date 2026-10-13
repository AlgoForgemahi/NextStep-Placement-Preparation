package com.nextstep.web;
import com.nextstep.entity.*;
import com.nextstep.repository.*;
import com.nextstep.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") public class PracticeController {
 final QuizService quizzes;final QuizAttemptRepository attempts;final BookmarkRepository bookmarks;final QuestionRepository questions;
 public PracticeController(QuizService quizzes,QuizAttemptRepository attempts,BookmarkRepository bookmarks,QuestionRepository questions){this.quizzes=quizzes;this.attempts=attempts;this.bookmarks=bookmarks;this.questions=questions;}
 record Start(@NotBlank String kind,String topic,String difficulty,@Min(1) @Max(50) int count,@Min(0) @Max(10800) int durationSeconds){}
 record Finish(@NotNull @Size(max=50) Map<String,Integer> answers){}
 @GetMapping("/questions") Object browse(@RequestParam String kind,@RequestParam(defaultValue="") String topic,@RequestParam(defaultValue="") String difficulty,@RequestParam(defaultValue="") String search,@RequestParam(defaultValue="0") int page){return quizzes.browse(kind,topic,difficulty,search,page);}
 @PostMapping("/quizzes") Object start(@Valid @RequestBody Start s){return quizzes.start(AuthController.uid(),s.kind(),s.topic(),s.difficulty(),s.count(),s.durationSeconds());}
 @PostMapping("/quizzes/{id}/submit") Object finish(@PathVariable long id,@Valid @RequestBody Finish f){return quizzes.finish(AuthController.uid(),id,f.answers());}
 @GetMapping("/quizzes") Object history(){return attempts.findByUserIdOrderByCreatedAtDesc(AuthController.uid()).stream().filter(a->!a.status.equals("IN_PROGRESS")).toList();}
 @GetMapping("/bookmarks") Object bookmarks(){return bookmarks.findByUserId(AuthController.uid()).stream().map(b->b.questionId).toList();}
 @PostMapping("/bookmarks/{id}") Object bookmark(@PathVariable long id){if(!questions.existsById(id))throw Errors.bad("Question not found.");var existing=bookmarks.findByUserIdAndQuestionId(AuthController.uid(),id);if(existing.isPresent()){bookmarks.delete(Objects.requireNonNull(existing.get(), "Bookmark must exist"));return Map.of("saved",false);}var b=new Bookmark();b.userId=AuthController.uid();b.questionId=id;bookmarks.save(b);return Map.of("saved",true);}
}
