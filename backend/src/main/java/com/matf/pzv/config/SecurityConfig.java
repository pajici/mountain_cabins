package com.matf.pzv.config;

import com.matf.pzv.db.dto.UserRepoInterface;
import com.matf.pzv.models.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserRepoInterface userRepo;

    public SecurityConfig(UserRepoInterface userRepo) {
        this.userRepo = userRepo;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> {
                org.springframework.security.web.csrf.CookieCsrfTokenRepository csrfTokenRepository = 
                    org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse();
                csrf
                    .csrfTokenRepository(csrfTokenRepository)
                    .ignoringRequestMatchers(
                        "/api/auth/**", 
                        "/api/registrations", 
                        "/api/admin/**",
                        "/api/tourist/reservations/**",
                        "/api/tourist/reviews",
                        "/api/owner/cabins/**",
                        "/api/owner/reservations/**"
                    );
            })
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/owner/**").hasRole("OWNER")
                .requestMatchers("/api/tourist/**").hasRole("TOURIST")
                .requestMatchers("/api/public/**", "/api/auth/**", "/api/registrations", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((request, response, authentication) -> {
                    String adminLoginHeader = request.getHeader("X-Admin-Login");
                    String userRole = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
                    
                    if (adminLoginHeader == null && "ADMIN".equals(userRole)) {
                        response.setStatus(403);
                        response.getWriter().write("Admin users must login via /admin/login");
                        return;
                    }
                    if ("true".equals(adminLoginHeader) && !"ADMIN".equals(userRole)) {
                        response.setStatus(403);
                        response.getWriter().write("Access denied. Admin login required.");
                        return;
                    }
                    response.setStatus(200);
                })
                .failureHandler((request, response, exception) -> response.setStatus(401))
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            Optional<User> userOpt = userRepo.findByUsername(username);
            if (userOpt.isEmpty()) {
                throw new UsernameNotFoundException("User not found");
            }
            User user = userOpt.get();
            return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole())
                .disabled(!user.isActive())
                .build();
        };
    }
}