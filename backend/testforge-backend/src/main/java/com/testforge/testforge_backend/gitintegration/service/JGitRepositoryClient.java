package com.testforge.testforge_backend.gitintegration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testforge.testforge_backend.gitintegration.dto.GitChangeResponse;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationConflictException;
import com.testforge.testforge_backend.gitintegration.exception.GitIntegrationException;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.RemoteRefUpdate;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

@Component
public class JGitRepositoryClient implements GitRepositoryClient {
    private static final String MANIFEST = ".testforge/generated-manifest.json";
    private final Path workspaceRoot; private final ObjectMapper mapper;
    public JGitRepositoryClient(@Value("${testforge.git.workspace-root:${java.io.tmpdir}/testforge-git}") String root){workspaceRoot=Path.of(root).toAbsolutePath().normalize();this.mapper=new ObjectMapper();}

    @Override public void testConnection(RepositoryTarget target,GitCredentialVault.Credential credential){withClone(target,credential,(git,root)->null);}
    @Override public GitChangeResponse preview(RepositoryTarget target,GitCredentialVault.Credential credential,Map<String,String> files,String hash){return withClone(target,credential,(git,root)->{apply(root,target.projectPath(),files,hash);return changes(git,target.projectPath());});}
    @Override public PushResult sync(RepositoryTarget target,GitCredentialVault.Credential credential,Map<String,String> files,String hash,String message){
        return withClone(target,credential,(git,root)->{
            apply(root,target.projectPath(),files,hash); GitChangeResponse change=changes(git,target.projectPath());
            if(!change.hasChanges()) return new PushResult(false,ObjectId.toString(git.getRepository().resolve("HEAD")),change);
            git.add().addFilepattern(target.projectPath().replace('\\','/')).call();
            git.add().setUpdate(true).addFilepattern(target.projectPath().replace('\\','/')).call();
            var commit=git.commit().setMessage(message).setAuthor("TestForge","automation@testforge.local").setCommitter("TestForge","automation@testforge.local").call();
            var results=git.push().setCredentialsProvider(credentials(credential)).call();
            for(var result:results) for(RemoteRefUpdate update:result.getRemoteUpdates()) if(update.getStatus()!=RemoteRefUpdate.Status.OK&&update.getStatus()!=RemoteRefUpdate.Status.UP_TO_DATE)
                throw new GitIntegrationConflictException("The repository contains newer remote changes or rejected the push. Review the repository before synchronizing again.");
            return new PushResult(true,commit.getId().name(),change);
        });
    }

    private <T>T withClone(RepositoryTarget target,GitCredentialVault.Credential credential,Operation<T> operation){
        Path workspace=workspaceRoot.resolve(safe(target.projectId())+"-"+UUID.randomUUID()).normalize();
        if(!workspace.startsWith(workspaceRoot)) throw new GitIntegrationException("Unable to create a safe Git workspace.");
        try{
            Files.createDirectories(workspaceRoot);
            try(Git git=Git.cloneRepository().setURI(target.repositoryUrl()).setBranch("refs/heads/"+target.branch()).setDirectory(workspace.toFile()).setCredentialsProvider(credentials(credential)).call()){
                return operation.run(git,workspace);
            }
        }catch(GitIntegrationException|GitIntegrationConflictException e){throw e;}
        catch(Exception e){throw safeFailure(e);}
        finally{deleteTree(workspace);}
    }

    private void apply(Path repository,String projectPath,Map<String,String> files,String hash)throws IOException{
        Path root=repository.resolve(projectPath).normalize(); if(!root.startsWith(repository))throw new GitIntegrationException("Automation Project Path escapes the repository.");
        Path manifest=root.resolve(MANIFEST).normalize(); Set<String> previous=new HashSet<>();
        if(Files.exists(manifest)){try{Manifest stored=mapper.readValue(manifest.toFile(),Manifest.class);previous.addAll(stored.files());}catch(Exception e){throw new GitIntegrationConflictException("The TestForge generated-file manifest is invalid. Review the repository before synchronizing.");}}
        for(String old:previous)if(!files.containsKey(old)){Path target=root.resolve(old).normalize();if(target.startsWith(root))Files.deleteIfExists(target);}
        for(var file:files.entrySet()){Path target=root.resolve(file.getKey()).normalize();if(!target.startsWith(root))throw new GitIntegrationException("Generated file path is invalid.");Files.createDirectories(target.getParent());Files.writeString(target,file.getValue(),StandardCharsets.UTF_8,StandardOpenOption.CREATE,StandardOpenOption.TRUNCATE_EXISTING);}
        Files.createDirectories(manifest.getParent()); mapper.writerWithDefaultPrettyPrinter().writeValue(manifest.toFile(),new Manifest(hash,files.keySet().stream().sorted().toList()));
    }

    private GitChangeResponse changes(Git git,String projectPath)throws Exception{
        Status status=git.status().call(); String prefix=projectPath.replace('\\','/')+"/";
        SortedSet<String> added=within(prefix,status.getAdded(),status.getUntracked());
        SortedSet<String> modified=within(prefix,status.getChanged(),status.getModified());
        SortedSet<String> deleted=within(prefix,status.getMissing(),status.getRemoved());
        return new GitChangeResponse(List.copyOf(added),List.copyOf(modified),List.copyOf(deleted),!added.isEmpty()||!modified.isEmpty()||!deleted.isEmpty());
    }
    @SafeVarargs private final SortedSet<String> within(String prefix,Set<String>... groups){SortedSet<String> result=new TreeSet<>();for(Set<String> group:groups)for(String path:group)if(path.startsWith(prefix))result.add(path.substring(prefix.length()));return result;}
    private CredentialsProvider credentials(GitCredentialVault.Credential value){return new UsernamePasswordCredentialsProvider(value.username(),value.token());}
    private RuntimeException safeFailure(Exception e){String name=e.getClass().getName();if(name.contains("Transport")||name.contains("Authentication"))return new GitIntegrationException("Repository could not be accessed. Verify the URL, branch, credential, and repository permissions.");return new GitIntegrationException("Git operation failed safely. Review the repository configuration and try again.");}
    private String safe(String value){return value.replaceAll("[^A-Za-z0-9._-]","-");}
    private void deleteTree(Path root){if(root==null||!root.startsWith(workspaceRoot)||!Files.exists(root))return;try(var paths=Files.walk(root)){paths.sorted(Comparator.reverseOrder()).forEach(path->{try{Files.deleteIfExists(path);}catch(IOException ignored){}});}catch(IOException ignored){}}
    private interface Operation<T>{T run(Git git,Path root)throws Exception;}
    private record Manifest(String contentHash,List<String> files){public Manifest{files=files==null?List.of():List.copyOf(files);}}
}
