package com.testforge.testforge_backend.gitintegration.service;

import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.exception.ProjectNotFoundException;
import com.testforge.testforge_backend.gitintegration.dto.*;
import com.testforge.testforge_backend.gitintegration.entity.*;
import com.testforge.testforge_backend.gitintegration.exception.*;
import com.testforge.testforge_backend.gitintegration.repository.*;
import com.testforge.testforge_backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class GitIntegrationService {
    private final ProjectRepository projects; private final GitIntegrationConfigurationRepository configs; private final GitSyncHistoryRepository history;
    private final GitConfigurationValidator validator; private final GitCredentialVault vault; private final ProjectAutomationProjectGenerator generator; private final GitRepositoryClient git;
    private final ConcurrentHashMap<String, AtomicBoolean> syncing=new ConcurrentHashMap<>();
    public GitIntegrationService(ProjectRepository projects,GitIntegrationConfigurationRepository configs,GitSyncHistoryRepository history,GitConfigurationValidator validator,GitCredentialVault vault,ProjectAutomationProjectGenerator generator,GitRepositoryClient git){this.projects=projects;this.configs=configs;this.history=history;this.validator=validator;this.vault=vault;this.generator=generator;this.git=git;}

    @Transactional(readOnly=true)
    public GitConfigurationResponse get(String projectId){
        project(projectId); return configs.findByProject_ProjectId(projectId).map(this::response).orElseGet(()->new GitConfigurationResponse(false,projectId,"","main","testforge-automation","TestForge: Update automation",false,GitSyncStatus.NOT_SYNCED,null,null,null,List.of()));
    }

    @Transactional
    public GitConfigurationResponse save(String projectId,GitConfigurationRequest request){
        validator.validate(request.repositoryUrl().trim(),request.branch().trim(),request.automationProjectPath().trim(),request.commitMessageTemplate().trim());
        Project project=project(projectId); LocalDateTime now=LocalDateTime.now();
        GitIntegrationConfiguration config=configs.findByProject_ProjectId(projectId).orElseGet(()->{var value=new GitIntegrationConfiguration();value.setProject(project);value.setCreatedAt(now);value.setLastSyncStatus(GitSyncStatus.NOT_SYNCED);return value;});
        boolean repositoryChanged=!request.repositoryUrl().trim().equals(config.getRepositoryUrl());
        boolean changed=repositoryChanged||!request.branch().trim().equals(config.getBranchName())||!request.automationProjectPath().trim().equals(config.getAutomationProjectPath());
        config.setRepositoryUrl(request.repositoryUrl().trim());config.setBranchName(request.branch().trim());config.setAutomationProjectPath(request.automationProjectPath().trim());config.setCommitMessageTemplate(request.commitMessageTemplate().trim());config.setUpdatedAt(now);
        if(changed){config.setLastSuccessfulContentHash(null);config.setLastSyncStatus(GitSyncStatus.NOT_SYNCED);config.setLastCommitSha(null);config.setLastSyncAt(null);config.setLastErrorSummary(null);}
        configs.save(config);if(repositoryChanged&&(request.credentialToken()==null||request.credentialToken().isBlank()))vault.remove(projectId);vault.put(projectId,request.credentialUsername(),request.credentialToken());return response(config);
    }

    @Transactional(readOnly=true)
    public GitConnectionResponse testConnection(String projectId){var config=require(projectId);git.testConnection(target(config),vault.require(projectId));return new GitConnectionResponse(true,"Connected successfully. Repository and branch are accessible.");}
    @Transactional(readOnly=true)
    public GitChangeResponse changes(String projectId){var config=require(projectId);var generated=generator.generate(projectId);return git.preview(target(config),vault.require(projectId),generated.files(),generated.contentHash());}

    @Transactional(noRollbackFor=RuntimeException.class)
    public GitSyncResponse sync(String projectId,GitSyncRequest request){
        AtomicBoolean guard=syncing.computeIfAbsent(projectId,key->new AtomicBoolean());
        if(!guard.compareAndSet(false,true))throw new GitIntegrationConflictException("Git synchronization is already running for this Project.");
        try{return doSync(projectId,request);}catch(org.springframework.dao.PessimisticLockingFailureException exception){throw new GitIntegrationConflictException("Git synchronization is already running for this Project.");}finally{guard.set(false);}
    }

    protected GitSyncResponse doSync(String projectId,GitSyncRequest request){
        GitIntegrationConfiguration config=configs.findForSync(projectId).orElseThrow(()->new GitIntegrationException("Git integration is not configured for this Project."));validator.validate(config.getRepositoryUrl(),config.getBranchName(),config.getAutomationProjectPath(),request.commitMessage());
        GeneratedAutomationProject generated=generator.generate(projectId);
        try{
            var pushed=git.sync(target(config),vault.require(projectId),generated.files(),generated.contentHash(),request.commitMessage().trim());
            LocalDateTime now=LocalDateTime.now();config.setLastSuccessfulContentHash(generated.contentHash());config.setLastSyncStatus(GitSyncStatus.SYNCED);config.setLastSyncAt(now);config.setLastCommitSha(pushed.commitSha());config.setLastErrorSummary(null);config.setUpdatedAt(now);configs.save(config);
            record(config,GitSyncStatus.SYNCED,pushed.commitSha(),pushed.changed()?"Generated automation committed and pushed.":"Repository already synchronized.",now);
            return new GitSyncResponse(GitSyncStatus.SYNCED,pushed.changed()?"Automation committed and pushed.":"Repository is already synchronized.",pushed.commitSha(),pushed.changes());
        }catch(RuntimeException exception){recordFailure(config,exception);throw exception;}
    }

    private GitConfigurationResponse response(GitIntegrationConfiguration config){
        GitSyncStatus status=config.getLastSyncStatus();
        if(status==GitSyncStatus.SYNCED&&config.getLastSuccessfulContentHash()!=null){try{if(!config.getLastSuccessfulContentHash().equals(generator.generate(config.getProject().getProjectId()).contentHash()))status=GitSyncStatus.CHANGES_PENDING;}catch(RuntimeException ignored){status=GitSyncStatus.CHANGES_PENDING;}}
        List<GitSyncHistoryResponse> recent=history.findTop10ByConfigurationIdOrderByCreatedAtDesc(config.getId()).stream().map(v->new GitSyncHistoryResponse(v.getStatus(),v.getCommitSha(),v.getSummary(),v.getCreatedAt())).toList();
        return new GitConfigurationResponse(true,config.getProject().getProjectId(),config.getRepositoryUrl(),config.getBranchName(),config.getAutomationProjectPath(),config.getCommitMessageTemplate(),vault.contains(config.getProject().getProjectId()),status,config.getLastSyncAt(),config.getLastCommitSha(),config.getLastErrorSummary(),recent);
    }
    private void record(GitIntegrationConfiguration config,GitSyncStatus status,String sha,String summary,LocalDateTime now){var item=new GitSyncHistory();item.setConfiguration(config);item.setStatus(status);item.setCommitSha(sha);item.setSummary(summary);item.setCreatedAt(now);history.save(item);}
    private void recordFailure(GitIntegrationConfiguration config,RuntimeException exception){LocalDateTime now=LocalDateTime.now();String summary=exception instanceof GitIntegrationException||exception instanceof GitIntegrationConflictException?exception.getMessage():"Git synchronization failed.";config.setLastSyncStatus(GitSyncStatus.SYNC_FAILED);config.setLastErrorSummary(summary);config.setUpdatedAt(now);configs.save(config);record(config,GitSyncStatus.SYNC_FAILED,null,summary,now);}
    private GitIntegrationConfiguration require(String projectId){project(projectId);return configs.findByProject_ProjectId(projectId).orElseThrow(()->new GitIntegrationException("Git integration is not configured for this Project."));}
    private Project project(String projectId){return projects.findByProjectId(projectId).orElseThrow(()->new ProjectNotFoundException("Project not found: "+projectId));}
    private GitRepositoryClient.RepositoryTarget target(GitIntegrationConfiguration c){return new GitRepositoryClient.RepositoryTarget(c.getProject().getProjectId(),c.getRepositoryUrl(),c.getBranchName(),c.getAutomationProjectPath());}
}
