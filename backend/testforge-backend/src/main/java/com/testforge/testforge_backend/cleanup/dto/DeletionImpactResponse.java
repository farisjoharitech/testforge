package com.testforge.testforge_backend.cleanup.dto;

import java.util.List;
import java.util.Map;

public record DeletionImpactResponse(
        String resourceType, Long resourceId, String businessId,
        Map<String, Long> owned, Map<String, Long> preserved,
        List<String> blockers, boolean canDelete
) {}
