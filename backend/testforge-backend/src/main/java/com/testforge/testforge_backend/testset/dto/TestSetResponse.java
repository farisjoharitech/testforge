package com.testforge.testforge_backend.testset.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TestSetResponse(
        Long id,
        String testSetId,
        Long testPlanId,
        String testPlanBusinessId,
        String testPlanName,
        String name,
        String description,
        int memberCount,
        List<TestSetMemberResponse> members,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
