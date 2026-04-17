package quizards.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Principal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long startedAt = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = System.currentTimeMillis() - startedAt;
            String queryString = request.getQueryString();
            String path = queryString == null || queryString.isBlank()
                    ? request.getRequestURI()
                    : request.getRequestURI() + "?" + queryString;
            String sessionId = request.getRequestedSessionId();
            if (sessionId == null && request.getSession(false) != null) {
                sessionId = request.getSession(false).getId();
            }
            Principal principal = request.getUserPrincipal();
            String principalName = principal != null ? principal.getName() : "anonymous";

            logger.info("{} {} -> {} ({} ms, session={}, user={})",
                    request.getMethod(),
                    path,
                    response.getStatus(),
                    durationMs,
                    sessionId == null ? "-" : sessionId,
                    principalName);
        }
    }
}
