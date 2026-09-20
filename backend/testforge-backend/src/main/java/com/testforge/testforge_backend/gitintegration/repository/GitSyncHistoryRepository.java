package com.testforge.testforge_backend.gitintegration.repository;
import com.testforge.testforge_backend.gitintegration.entity.GitSyncHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface GitSyncHistoryRepository extends JpaRepository<GitSyncHistory,Long> { List<GitSyncHistory> findTop10ByConfigurationIdOrderByCreatedAtDesc(Long configurationId); }
