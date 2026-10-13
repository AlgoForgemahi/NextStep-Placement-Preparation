package com.nextstep.service;
import org.junit.jupiter.api.Test;import static org.junit.jupiter.api.Assertions.*;import org.springframework.mock.web.MockMultipartFile;
class ResumeServiceTest {
 @Test void explainsCompletenessAndDetectsSkills(){var report=new ResumeService().analyzeText("test@example.test 9876543210 Education Skills Java Spring SQL Projects Experience GitHub Improved by 20%","Java Developer","Java Spring SQL",1);assertEquals(100,report.get("score"));assertEquals(100,report.get("matchPercent"));assertTrue(report.get("method").toString().contains("not AI"));}
 @Test void rejectsUnsupportedUploads(){assertThrows(org.springframework.web.server.ResponseStatusException.class,()->new ResumeService().analyze(new MockMultipartFile("file","test.exe","application/octet-stream",new byte[]{1}),"Developer",""));}
 @Test void extractsDocxText() throws Exception {try(var doc=new org.apache.poi.xwpf.usermodel.XWPFDocument();var out=new java.io.ByteArrayOutputStream()){doc.createParagraph().createRun().setText("Education Skills Java Projects Experience test@example.test");doc.write(out);var report=new ResumeService().analyze(new MockMultipartFile("file","resume.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document",out.toByteArray()),"Java Developer","");assertTrue(report.get("skills").toString().contains("java"));}}
}
