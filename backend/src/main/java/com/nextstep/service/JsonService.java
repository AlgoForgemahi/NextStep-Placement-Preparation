package com.nextstep.service;
import com.fasterxml.jackson.databind.*;
import org.springframework.stereotype.Service;
@Service public class JsonService {
 private final ObjectMapper mapper; public JsonService(ObjectMapper mapper){this.mapper=mapper;}
 public String write(Object value){try{return mapper.writeValueAsString(value);}catch(Exception e){throw new IllegalArgumentException("Invalid data");}}
 public JsonNode read(String value){try{return mapper.readTree(value==null?"[]":value);}catch(Exception e){throw new IllegalArgumentException("Invalid stored data");}}
}
