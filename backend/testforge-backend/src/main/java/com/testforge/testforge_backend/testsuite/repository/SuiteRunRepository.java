package com.testforge.testforge_backend.testsuite.repository;

import com.testforge.testforge_backend.testsuite.entity.SuiteRun;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SuiteRunRepository extends JpaRepository<SuiteRun, Long> {
    @org.springframework.data.jpa.repository.Query("""
            select count(c) from SuiteTestCaseResult c
            where c.sourceTestCaseId = :id and c.scenarioResult.suiteRun.status in ('PENDING', 'RUNNING')
            """)
    long countActiveForTestCase(@org.springframework.data.repository.query.Param("id") Long id);

    boolean existsByProject_Id(Long id);
    long countByTestSuiteIdSnapshotAndStatusIn(Long suiteId, java.util.Collection<com.testforge.testforge_backend.testsuite.entity.SuiteResultStatus> statuses);
    Optional<SuiteRun> findTopByTestSuiteIdSnapshotOrderByStartedAtDescIdDesc(Long id);
    List<SuiteRun> findByProjectBusinessIdSnapshotOrderByStartedAtDescIdDesc(String projectId);
    List<SuiteRun> findByProjectBusinessIdSnapshotAndTestSuiteIdSnapshotOrderByStartedAtDescIdDesc(String projectId, Long suiteId);
    Optional<SuiteRun> findByIdAndProjectBusinessIdSnapshot(Long id, String projectId);
}
