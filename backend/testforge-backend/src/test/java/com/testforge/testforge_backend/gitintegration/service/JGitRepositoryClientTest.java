package com.testforge.testforge_backend.gitintegration.service;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.storage.file.WindowCacheConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.*; import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class JGitRepositoryClientTest {
 @TempDir Path temp;
 @Test void previewsCommitsAndDeletesOnlyManifestOwnedFiles()throws Exception{
  Path seed=temp.resolve("seed");
  try(Git source=Git.init().setInitialBranch("main").setDirectory(seed.toFile()).call()){
   Files.writeString(seed.resolve("developer-owned.txt"),"keep");source.add().addFilepattern(".").call();source.commit().setMessage("seed").setAuthor("Dev","dev@example.com").call();
  }
  Path remote=temp.resolve("remote.git");try(Git ignored=Git.cloneRepository().setBare(true).setURI(seed.toUri().toString()).setDirectory(remote.toFile()).call()){}
  var client=new JGitRepositoryClient(temp.resolve("work").toString());
  var target=new GitRepositoryClient.RepositoryTarget("PRJ-1",remote.toUri().toString(),"main","testforge-automation");var credential=new GitCredentialVault.Credential("unused","unused");
  client.testConnection(target,credential);
  var preview=client.preview(target,credential,Map.of("pom.xml","one","src/test/A.java","class A {}"),"hash-1");assertTrue(preview.added().contains("pom.xml"));
  var first=client.sync(target,credential,Map.of("pom.xml","one","src/test/A.java","class A {}"),"hash-1","TestForge: first");assertTrue(first.changed());assertNotNull(first.commitSha());
  var unchanged=client.sync(target,credential,Map.of("pom.xml","one","src/test/A.java","class A {}"),"hash-1","TestForge: same");assertFalse(unchanged.changed());
  var second=client.sync(target,credential,Map.of("pom.xml","two","src/test/B.java","class B {}"),"hash-2","TestForge: update");assertTrue(second.changes().deleted().contains("src/test/A.java"));assertTrue(second.changes().added().contains("src/test/B.java"));
  Path verify=temp.resolve("verify");try(Git ignored=Git.cloneRepository().setURI(remote.toUri().toString()).setDirectory(verify.toFile()).call()){}
  assertEquals("keep",Files.readString(verify.resolve("developer-owned.txt")));assertEquals("two",Files.readString(verify.resolve("testforge-automation/pom.xml")));assertFalse(Files.exists(verify.resolve("testforge-automation/src/test/A.java")));assertTrue(Files.exists(verify.resolve("testforge-automation/src/test/B.java")));
  WindowCacheConfig cache=new WindowCacheConfig();cache.setPackedGitUseStrongRefs(false);cache.setPackedIndexGitUseStrongRefs(false);cache.install();
 }
}
