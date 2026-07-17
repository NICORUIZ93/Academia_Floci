// Spring Security (Módulo 4): cadena de filtros con endpoints públicos/protegidos
// y contraseñas con BCrypt (Spring Security moderno, sin WebSecurityConfigurerAdapter).
package com.ejemplo.tareas;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SecurityConfig {

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        // CSRF protege formularios con sesión/cookies; una API stateless con JWT
        // en el header Authorization no lo necesita — el token no viaja en cookies.
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/tareas/**").authenticated()
            .anyRequest().denyAll()
        )
        // El filtro que valida el JWT en cada request se añadiría aquí con
        // .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    // BCrypt: hash con salt incorporado y factor de costo configurable — nunca
    // guardar contraseñas en texto plano ni con hashes rápidos como MD5/SHA-256 solos.
    return new BCryptPasswordEncoder();
  }
}
