package com.example.project.randomFood;


import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class UUIDSessionFilter implements Filter {

    private static final String SESSION_UUID_KEY = "user_uuid";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpSession session = req.getSession(true); // 세션 없으면 새로 생성

        if (session.getAttribute(SESSION_UUID_KEY) == null) {
            String uuid = UUID.randomUUID().toString();
            session.setAttribute(SESSION_UUID_KEY, uuid);

            session.setMaxInactiveInterval(10 * 60);
            System.out.println("New session UUID created: " + uuid);
        }

        chain.doFilter(request, response);
    }
}
