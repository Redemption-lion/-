package com.gym.util;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

public class JwtUtil {
    private static final String SECRET = "gym_secret_key_2026";
    private static final long EXPIRE = 7 * 24 * 3600 * 1000L;

    public static String generateToken(Integer userId, String username) {
        return JWT.create()
                .withClaim("userId", userId)
                .withClaim("username", username)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRE))
                .sign(Algorithm.HMAC256(SECRET));
    }

    public static Integer getUserId(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET))
                .build()
                .verify(token)
                .getClaim("userId")
                .asInt();
    }
}