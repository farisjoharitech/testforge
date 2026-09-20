package com.testforge.testforge_backend.gitintegration.service;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationException; import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class GitConfigurationValidatorTest {
 private final GitConfigurationValidator validator=new GitConfigurationValidator();
 @Test void acceptsSafeDedicatedPath(){assertDoesNotThrow(()->validator.validate("https://example.com/team/tests.git","main","testforge-automation","TestForge: update"));}
 @Test void rejectsTraversalAbsoluteGitDirectoryAndEmbeddedCredential(){assertAll(
  ()->assertThrows(GitIntegrationException.class,()->validator.validate("https://example.com/a.git","main","../outside","update")),
  ()->assertThrows(GitIntegrationException.class,()->validator.validate("https://example.com/a.git","main","C:/outside","update")),
  ()->assertThrows(GitIntegrationException.class,()->validator.validate("https://example.com/a.git","main",".git","update")),
  ()->assertThrows(GitIntegrationException.class,()->validator.validate("https://token@example.com/a.git","main","generated","update")));}
 @Test void rejectsUnsafeBranchAndMultilineCommit(){assertAll(
  ()->assertThrows(GitIntegrationException.class,()->validator.validate("https://example.com/a.git","../main","generated","update")),
  ()->assertThrows(GitIntegrationException.class,()->validator.validate("https://example.com/a.git","main","generated","update\nnext")));}
}
