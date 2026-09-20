package com.testforge.testforge_backend.gitintegration.repository;
import com.testforge.testforge_backend.gitintegration.entity.GitIntegrationConfiguration;
import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.EntityGraph; import org.springframework.data.jpa.repository.Lock; import org.springframework.data.jpa.repository.Query; import org.springframework.data.jpa.repository.QueryHints; import jakarta.persistence.LockModeType; import jakarta.persistence.QueryHint;
import java.util.Optional;
public interface GitIntegrationConfigurationRepository extends JpaRepository<GitIntegrationConfiguration,Long> {
 @EntityGraph(attributePaths="project") Optional<GitIntegrationConfiguration> findByProject_ProjectId(String projectId);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @QueryHints(@QueryHint(name="jakarta.persistence.lock.timeout",value="0")) @EntityGraph(attributePaths="project") @Query("select c from GitIntegrationConfiguration c where c.project.projectId=:projectId") Optional<GitIntegrationConfiguration> findForSync(String projectId);
}
