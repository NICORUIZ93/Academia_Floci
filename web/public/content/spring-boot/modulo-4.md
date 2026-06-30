## SecurityFilterChain moderno

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable()) // API stateless con JWT: no usa sesiones basadas en cookies
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

## Filtro JWT

```java
public class JwtFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String token = extraerToken(req);
        if (token != null && jwtService.esValido(token)) {
            var auth = new UsernamePasswordAuthenticationToken(jwtService.getUsuario(token), null, jwtService.getAuthorities(token));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);
    }
}
```

## Autorización por rol

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void eliminar(@PathVariable Long id) { ... }
```

## CORS

```java
@Bean
CorsConfigurationSource corsConfig() {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://miapp.com"));
    // ...
}
```
