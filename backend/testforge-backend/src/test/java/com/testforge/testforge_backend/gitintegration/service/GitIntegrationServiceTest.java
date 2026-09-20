package com.testforge.testforge_backend.gitintegration.service;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.gitintegration.dto.*;
import com.testforge.testforge_backend.gitintegration.entity.*;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationConflictException;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationException;
import com.testforge.testforge_backend.gitintegration.repository.*;
import com.testforge.testforge_backend.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import java.util.*; import java.util.concurrent.*; import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*; import static org.mockito.Mockito.*;

class GitIntegrationServiceTest {
 @Test void recordsSanitizedFailureWithoutCredential(){
  Project project=project();GitIntegrationConfiguration config=config(project);ProjectRepository projects=mock(ProjectRepository.class);GitIntegrationConfigurationRepository configs=mock(GitIntegrationConfigurationRepository.class);GitSyncHistoryRepository history=mock(GitSyncHistoryRepository.class);when(configs.findForSync("PRJ-1")).thenReturn(Optional.of(config));GitCredentialVault vault=new GitCredentialVault();vault.put("PRJ-1","qa","secret-token");ProjectAutomationProjectGenerator generator=mock(ProjectAutomationProjectGenerator.class);when(generator.generate("PRJ-1")).thenReturn(new GeneratedAutomationProject(Map.of("pom.xml","x"),"hash"));GitRepositoryClient client=mock(GitRepositoryClient.class);when(client.sync(any(),any(),anyMap(),anyString(),anyString())).thenThrow(new GitIntegrationException("Authentication failed."));
  GitIntegrationService service=service(projects,configs,history,vault,client,generator);GitIntegrationException thrown=assertThrows(GitIntegrationException.class,()->service.sync("PRJ-1",new GitSyncRequest("update")));assertFalse(thrown.getMessage().contains("secret-token"));assertEquals(GitSyncStatus.SYNC_FAILED,config.getLastSyncStatus());assertEquals("Authentication failed.",config.getLastErrorSummary());verify(history).save(argThat(item->!item.getSummary().contains("secret-token")));
 }
 @Test void reportsPendingWhenGeneratedContentChangedAfterSync(){
  Project project=project();GitIntegrationConfiguration config=config(project);config.setLastSyncStatus(GitSyncStatus.SYNCED);config.setLastSuccessfulContentHash("old");ProjectRepository projects=mock(ProjectRepository.class);GitIntegrationConfigurationRepository configs=mock(GitIntegrationConfigurationRepository.class);GitSyncHistoryRepository history=mock(GitSyncHistoryRepository.class);when(projects.findByProjectId("PRJ-1")).thenReturn(Optional.of(project));when(configs.findByProject_ProjectId("PRJ-1")).thenReturn(Optional.of(config));when(history.findTop10ByConfigurationIdOrderByCreatedAtDesc(null)).thenReturn(List.of());ProjectAutomationProjectGenerator generator=mock(ProjectAutomationProjectGenerator.class);when(generator.generate("PRJ-1")).thenReturn(new GeneratedAutomationProject(Map.of("pom.xml","new"),"new"));
  assertEquals(GitSyncStatus.CHANGES_PENDING,service(projects,configs,history,new GitCredentialVault(),mock(GitRepositoryClient.class),generator).get("PRJ-1").status());
 }
 @Test void savesConfigurationWithoutReturningCredential(){
  ProjectRepository projects=mock(ProjectRepository.class);GitIntegrationConfigurationRepository configs=mock(GitIntegrationConfigurationRepository.class);GitSyncHistoryRepository history=mock(GitSyncHistoryRepository.class);Project project=project();
  when(projects.findByProjectId("PRJ-1")).thenReturn(Optional.of(project));when(configs.findByProject_ProjectId("PRJ-1")).thenReturn(Optional.empty());when(history.findTop10ByConfigurationIdOrderByCreatedAtDesc(null)).thenReturn(List.of());
  GitCredentialVault vault=new GitCredentialVault();var service=service(projects,configs,history,vault,mock(GitRepositoryClient.class),mock(ProjectAutomationProjectGenerator.class));
  var response=service.save("PRJ-1",new GitConfigurationRequest("https://example.com/team/tests.git","main","testforge-automation","TestForge: update","qa","very-secret-token"));
  assertTrue(response.credentialConfigured());assertFalse(Arrays.stream(response.getClass().getRecordComponents()).anyMatch(c->c.getName().toLowerCase().contains("token")));assertEquals("https://example.com/team/tests.git",response.repositoryUrl());
 }
 @Test void blocksConcurrentSynchronizationForSameProject()throws Exception{
  Project project=project();GitIntegrationConfiguration config=config(project);ProjectRepository projects=mock(ProjectRepository.class);GitIntegrationConfigurationRepository configs=mock(GitIntegrationConfigurationRepository.class);GitSyncHistoryRepository history=mock(GitSyncHistoryRepository.class);when(projects.findByProjectId("PRJ-1")).thenReturn(Optional.of(project));when(configs.findByProject_ProjectId("PRJ-1")).thenReturn(Optional.of(config));when(configs.findForSync("PRJ-1")).thenReturn(Optional.of(config));
  GitCredentialVault vault=new GitCredentialVault();vault.put("PRJ-1","qa","secret");ProjectAutomationProjectGenerator generator=mock(ProjectAutomationProjectGenerator.class);when(generator.generate("PRJ-1")).thenReturn(new GeneratedAutomationProject(Map.of("pom.xml","x"),"hash"));
  CountDownLatch entered=new CountDownLatch(1),release=new CountDownLatch(1);AtomicInteger calls=new AtomicInteger();GitRepositoryClient client=new GitRepositoryClient(){public void testConnection(RepositoryTarget t,GitCredentialVault.Credential c){}public GitChangeResponse preview(RepositoryTarget t,GitCredentialVault.Credential c,Map<String,String>f,String h){return null;}public PushResult sync(RepositoryTarget t,GitCredentialVault.Credential c,Map<String,String>f,String h,String m){calls.incrementAndGet();entered.countDown();try{release.await(5,TimeUnit.SECONDS);}catch(InterruptedException e){Thread.currentThread().interrupt();}return new PushResult(false,"abc",new GitChangeResponse(List.of(),List.of(),List.of(),false));}};
  GitIntegrationService service=service(projects,configs,history,vault,client,generator);ExecutorService pool=Executors.newSingleThreadExecutor();Future<?> first=pool.submit(()->service.sync("PRJ-1",new GitSyncRequest("update")));assertTrue(entered.await(2,TimeUnit.SECONDS));assertThrows(GitIntegrationConflictException.class,()->service.sync("PRJ-1",new GitSyncRequest("update")));release.countDown();first.get(2,TimeUnit.SECONDS);pool.shutdownNow();assertEquals(1,calls.get());
 }
 private GitIntegrationService service(ProjectRepository projects,GitIntegrationConfigurationRepository configs,GitSyncHistoryRepository history,GitCredentialVault vault,GitRepositoryClient client,ProjectAutomationProjectGenerator generator){return new GitIntegrationService(projects,configs,history,new GitConfigurationValidator(),vault,generator,client);}
 private Project project(){Project p=new Project();p.setProjectId("PRJ-1");p.setName("Portal");return p;}
 private GitIntegrationConfiguration config(Project p){GitIntegrationConfiguration c=new GitIntegrationConfiguration();c.setProject(p);c.setRepositoryUrl("https://example.com/tests.git");c.setBranchName("main");c.setAutomationProjectPath("testforge-automation");c.setCommitMessageTemplate("update");c.setLastSyncStatus(GitSyncStatus.NOT_SYNCED);return c;}
}
