package com.nextstep.web;
import com.nextstep.entity.User;
import com.nextstep.repository.UserRepository;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api") public class AuthController {
 final UserRepository users;final BCryptPasswordEncoder encoder;final SecurityContextRepository contexts;
 public AuthController(UserRepository users,BCryptPasswordEncoder encoder,SecurityContextRepository contexts){this.users=users;this.encoder=encoder;this.contexts=contexts;}
 public static long uid(){return Long.parseLong(SecurityContextHolder.getContext().getAuthentication().getName());}
 public record Credentials(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password,@Size(max=100) String name){}
 public record Profile(@NotBlank @Size(max=100) String name,@Size(max=100) String department,@Size(max=100) String targetRole,@Min(1) @Max(100) int dailyGoal){}
 Map<String,Object> view(User u){return Map.of("id",u.id,"name",u.name,"email",u.email,"department",u.department,"targetRole",u.targetRole,"dailyGoal",u.dailyGoal);}
 void signIn(User u,HttpServletRequest request,HttpServletResponse response){request.getSession();request.changeSessionId();var context=SecurityContextHolder.createEmptyContext();context.setAuthentication(new UsernamePasswordAuthenticationToken(u.id.toString(),null,List.of(new SimpleGrantedAuthority("ROLE_USER"))));SecurityContextHolder.setContext(context);contexts.saveContext(context,request,response);}
 @GetMapping("/health") Map<String,String> health(){return Map.of("status","ok");}
 @GetMapping("/auth/csrf") Map<String,String> csrf(CsrfToken token){return Map.of("token",token.getToken(),"header",token.getHeaderName());}
 @PostMapping("/auth/register") Map<String,Object> register(@Valid @RequestBody Credentials c,HttpServletRequest r,HttpServletResponse s){if(c.name()==null||c.name().isBlank())throw Errors.bad("Name is required.");if(c.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw Errors.bad("Password must fit within 72 UTF-8 bytes.");var u=new User();u.name=c.name().trim();u.email=c.email().trim().toLowerCase(Locale.ROOT);u.password=encoder.encode(c.password());u.role="USER";u.department="";u.targetRole="Software Developer";u.dailyGoal=10;users.saveAndFlush(u);signIn(u,r,s);return view(u);}
 @PostMapping("/auth/login") Map<String,Object> login(@Valid @RequestBody Credentials c,HttpServletRequest r,HttpServletResponse s){var u=users.findByEmail(c.email().trim().toLowerCase(Locale.ROOT)).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password."));if(!encoder.matches(c.password(),u.password))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password.");signIn(u,r,s);return view(u);}
 @PostMapping("/logout") void logout(HttpServletRequest r){if(r.getSession(false)!=null)r.getSession().invalidate();SecurityContextHolder.clearContext();}
 @GetMapping("/profile") Map<String,Object> profile(){return view(users.findById(uid()).orElseThrow());}
 @PutMapping("/profile") Map<String,Object> profile(@Valid @RequestBody Profile p){var u=users.findById(uid()).orElseThrow();u.name=p.name();u.department=Objects.toString(p.department(),"");u.targetRole=Objects.toString(p.targetRole(),"");u.dailyGoal=p.dailyGoal();return view(users.save(u));}
}
