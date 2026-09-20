package com.testforge.testforge_backend.gitintegration.service;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

/** Process-memory secret boundary. Secrets are never persisted, returned, logged, or written to generated files. */
@Component
public class GitCredentialVault {
    private final ConcurrentHashMap<String, Credential> values = new ConcurrentHashMap<>();
    public void put(String projectId, String username, String token) {
        if (token != null && !token.isBlank()) values.put(projectId, new Credential(username == null || username.isBlank() ? "oauth2" : username, token));
    }
    public Credential require(String projectId) {
        Credential value = values.get(projectId);
        if (value == null) throw new com.testforge.testforge_backend.gitintegration.exception.GitIntegrationException("Git credential is not available. Enter it again before testing or synchronizing.");
        return value;
    }
    public boolean contains(String projectId){return values.containsKey(projectId);}
    public void remove(String projectId){values.remove(projectId);}
    public record Credential(String username,String token) { }
}
