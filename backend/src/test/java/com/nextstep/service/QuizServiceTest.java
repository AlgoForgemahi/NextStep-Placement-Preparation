package com.nextstep.service;
import com.nextstep.entity.*;import com.nextstep.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;import org.junit.jupiter.api.Test;import java.util.*;import static org.junit.jupiter.api.Assertions.*;import static org.mockito.Mockito.*;
class QuizServiceTest {
 final QuestionRepository questions=mock(QuestionRepository.class);final QuizAttemptRepository attempts=mock(QuizAttemptRepository.class);final QuizService service=new QuizService(questions,attempts,new JsonService(new ObjectMapper()));
 QuizAttempt attempt(){var a=new QuizAttempt();a.id=1L;a.userId=7L;a.questionIds="[10]";a.status="IN_PROGRESS";a.durationSeconds=0;var q=new Question();q.id=10L;q.answer=2;q.prompt="Question";q.options="[\"A\",\"B\",\"C\",\"D\"]";q.topic="Test";q.difficulty="Easy";q.explanation="Because C";when(questions.findById(10L)).thenReturn(Optional.of(q));when(attempts.findById(1L)).thenReturn(Optional.of(a));when(attempts.save(a)).thenReturn(a);return a;}
 @Test void scoresAgainstStoredAnswer(){attempt();assertEquals(1,service.finish(7,1,Map.of("10",2)).score);}
 @Test void rejectsAnotherUsersAttempt(){attempt();assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.finish(8,1,Map.of("10",2)));}
 @Test void rejectsForgedQuestion(){attempt();assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.finish(7,1,Map.of("999",2)));}
 @Test void preventsDuplicateSubmission(){var a=attempt();a.status="COMPLETED";assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.finish(7,1,Map.of("10",2)));}
 @Test void lateSubmissionDoesNotEarnCredit(){var a=attempt();a.durationSeconds=60;a.createdAt=java.time.Instant.now().minusSeconds(100);var result=service.finish(7,1,Map.of("10",2));assertEquals("EXPIRED",result.status);assertEquals(0,result.score);}
}
