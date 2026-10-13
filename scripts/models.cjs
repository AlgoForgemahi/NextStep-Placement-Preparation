const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
function put(p,s){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);}
const models={
User:['users',{name:'String',email:'String',password:'String',role:'String',department:'String',targetRole:'String',dailyGoal:'Integer'},'Optional<User> findByEmail(String email);'],
Question:['questions',{kind:'String',topic:'String',difficulty:'String',prompt:'String',options:'String',answer:'Integer',explanation:'String'},''],
QuizAttempt:['quiz_attempts',{userId:'Long',kind:'String',status:'String',questionIds:'String',answers:'String',score:'Integer',total:'Integer',durationSeconds:'Integer',elapsedSeconds:'Integer',details:'String'},'List<QuizAttempt> findByUserIdOrderByCreatedAtDesc(Long userId);'],
Bookmark:['bookmarks',{userId:'Long',questionId:'Long'},'Optional<Bookmark> findByUserIdAndQuestionId(Long userId,Long questionId); List<Bookmark> findByUserId(Long userId);'],
CodingProblem:['coding_problems',{title:'String',topic:'String',difficulty:'String',description:'String',constraintsText:'String',tests:'String',hints:'String',solution:'String',complexity:'String'},''],
CodingSubmission:['coding_submissions',{userId:'Long',problemId:'Long',language:'String',code:'String',status:'String',details:'String'},'List<CodingSubmission> findByUserIdOrderByCreatedAtDesc(Long userId);'],
ResumeReview:['resume_reviews',{userId:'Long',filename:'String',targetRole:'String',score:'Integer',report:'String'},'List<ResumeReview> findByUserIdOrderByCreatedAtDesc(Long userId);'],
InterviewQuestion:['interview_questions',{category:'String',role:'String',prompt:'String',modelAnswer:'String',keyPoints:'String'},''],
InterviewSession:['interview_sessions',{userId:'Long',role:'String',category:'String',status:'String',durationSeconds:'Integer',elapsedSeconds:'Integer',questions:'String',answers:'String',score:'Integer'},'List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);'],
LearningGoal:['learning_goals',{userId:'Long',title:'String',dueDate:'String',completed:'Boolean'},'List<LearningGoal> findByUserIdOrderByCreatedAtDesc(Long userId);']
};
let sql='';const snake=s=>s.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());
for(const [name,[table,fields,methods]]of Object.entries(models)){
 const javaFields=Object.entries(fields).map(([f,t])=>`  @Column(name="${snake(f)}"${t==='String'?', columnDefinition="text"':''}) public ${t} ${f};`).join('\n');
 put(`backend/src/main/java/com/nextstep/entity/${name}.java`,`package com.nextstep.entity;\nimport jakarta.persistence.*;\nimport java.time.Instant;\n@Entity @Table(name="${table}") public class ${name} {\n @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;\n public Instant createdAt=Instant.now();\n${javaFields}\n}\n`);
 put(`backend/src/main/java/com/nextstep/repository/${name}Repository.java`,`package com.nextstep.repository;\nimport com.nextstep.entity.${name};\nimport org.springframework.data.jpa.repository.*;\nimport java.util.*;\npublic interface ${name}Repository extends JpaRepository<${name},Long>,JpaSpecificationExecutor<${name}> {${methods}}\n`);
 sql+=`CREATE TABLE ${table}(id BIGSERIAL PRIMARY KEY,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),${Object.entries(fields).map(([f,t])=>snake(f)+' '+({String:'TEXT',Long:'BIGINT',Integer:'INTEGER',Boolean:'BOOLEAN'}[t])+(f==='userId'?' NOT NULL REFERENCES users(id)':f==='questionId'?' NOT NULL REFERENCES questions(id)':f==='problemId'?' NOT NULL REFERENCES coding_problems(id)':'')).join(',')});\n`;
 if(fields.userId)sql+=`CREATE INDEX ${table}_user_idx ON ${table}(user_id,created_at DESC);\n`;
}
sql+='ALTER TABLE users ADD CONSTRAINT user_email_unique UNIQUE(email);\nALTER TABLE bookmarks ADD CONSTRAINT bookmark_unique UNIQUE(user_id,question_id);\nALTER TABLE questions ADD CONSTRAINT valid_answer CHECK(answer BETWEEN 0 AND 3);\n';
put('backend/src/main/resources/db/migration/V1__schema.sql',sql);
console.log('Created 10 JPA entities, repositories, and relational migration.');
