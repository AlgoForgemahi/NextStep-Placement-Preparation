package com.nextstep.config;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Configuration public class SecurityConfig {
 @Bean public BCryptPasswordEncoder encoder(){return new BCryptPasswordEncoder();}
 @Bean public SecurityContextRepository contexts(){return new HttpSessionSecurityContextRepository();}
 @Bean public SecurityFilterChain security(HttpSecurity http,SecurityContextRepository contexts) throws Exception {
  return http.securityContext(s->s.securityContextRepository(contexts))
   .authorizeHttpRequests(a->a.requestMatchers("/api/auth/**","/api/health","/error").permitAll().anyRequest().authenticated())
   .exceptionHandling(e->e.authenticationEntryPoint((r,s,x)->{s.setStatus(401);s.setContentType("application/json");s.getWriter().write("{\"message\":\"Please sign in.\"}");}).accessDeniedHandler((r,s,x)->{s.setStatus(403);s.setContentType("application/json");s.getWriter().write("{\"message\":\"Refresh the page and try again.\"}");}))
   .formLogin(f->f.disable()).httpBasic(h->h.disable()).logout(l->l.disable()).build();
 }
}
