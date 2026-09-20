package com.testforge.testforge_backend.service;

import com.testforge.testforge_backend.domain.Module;
import com.testforge.testforge_backend.domain.Project;
import com.testforge.testforge_backend.domain.TestPlan;
import com.testforge.testforge_backend.dto.CreateModuleRequest;
import com.testforge.testforge_backend.dto.ModuleResponse;
import com.testforge.testforge_backend.dto.UpdateModuleRequest;
import com.testforge.testforge_backend.exception.*;
import com.testforge.testforge_backend.repository.ModuleRepository;
import com.testforge.testforge_backend.repository.ProjectRepository;
import com.testforge.testforge_backend.repository.RequirementRepository;
import com.testforge.testforge_backend.repository.TestPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final ProjectRepository projectRepository;
    private final TestPlanRepository testPlanRepository;
    private final RequirementRepository requirementRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;
    private final com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService;

    public ModuleService(ModuleRepository moduleRepository, ProjectRepository projectRepository,
                         TestPlanRepository testPlanRepository,
                         RequirementRepository requirementRepository,
                         BusinessIdGeneratorService businessIdGeneratorService,
                         com.testforge.testforge_backend.cleanup.service.AuthoringDeletionService deletionService) {
        this.moduleRepository = moduleRepository;
        this.projectRepository = projectRepository;
        this.testPlanRepository = testPlanRepository;
        this.requirementRepository = requirementRepository;
        this.businessIdGeneratorService = businessIdGeneratorService;
        this.deletionService = deletionService;
    }

    public ModuleResponse create(String testPlanBusinessId, CreateModuleRequest request) {
        TestPlan testPlan = testPlanRepository.findByTestPlanId(testPlanBusinessId)
                .orElseThrow(() -> new TestPlanNotFoundException("Test Plan not found with testPlanId: " + testPlanBusinessId));
        Project project = testPlan.getProject();
        String moduleId = request.getModuleId() == null || request.getModuleId().isBlank()
                ? businessIdGeneratorService.generateModuleId() : request.getModuleId().trim();
        if (moduleRepository.existsByModuleId(moduleId))
            throw new DuplicateModuleException("Module ID already exists: " + moduleId);
        String name = request.getName().trim();
        if (moduleRepository.existsByTestPlanAndNameIgnoreCase(testPlan, name))
            throw new DuplicateModuleException("Module name already exists in Test Plan: " + name);
        Module module = new Module();
        module.setModuleId(moduleId);
        module.setProject(project);
        module.setTestPlan(testPlan);
        module.setName(name);
        module.setDescription(normalize(request.getDescription()));
        LocalDateTime now = LocalDateTime.now();
        module.setCreatedAt(now);
        module.setUpdatedAt(now);
        return toResponse(moduleRepository.save(module));
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> getByTestPlan(String testPlanBusinessId) {
        TestPlan testPlan = testPlanRepository.findByTestPlanId(testPlanBusinessId)
                .orElseThrow(() -> new TestPlanNotFoundException("Test Plan not found with testPlanId: " + testPlanBusinessId));
        return moduleRepository.findByTestPlanOrderByIdAsc(testPlan).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ModuleResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public ModuleResponse getByModuleId(String moduleId) {
        return toResponse(moduleRepository.findByModuleId(moduleId)
                .orElseThrow(() -> new ModuleNotFoundException("Module not found with moduleId: " + moduleId)));
    }

    public ModuleResponse update(Long id, UpdateModuleRequest request) {
        Module module = findById(id);
        String name = request.getName().trim();
        if (moduleRepository.existsByTestPlanAndNameIgnoreCaseAndIdNot(module.getTestPlan(), name, id))
            throw new DuplicateModuleException("Module name already exists in Test Plan: " + name);
        module.setName(name);
        module.setDescription(normalize(request.getDescription()));
        module.setUpdatedAt(LocalDateTime.now());
        return toResponse(module);
    }

    public void delete(Long id) {
        deletionService.deleteModule(id);
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private Module findById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ModuleNotFoundException("Module not found with id: " + id));
    }

    private ModuleResponse toResponse(Module module) {
        return new ModuleResponse(module.getId(), module.getModuleId(), module.getProject().getId(),
                module.getProject().getProjectId(), module.getProject().getName(),
                module.getTestPlan().getId(), module.getTestPlan().getTestPlanId(), module.getTestPlan().getName(),
                module.getName(), module.getDescription(), module.getCreatedAt(), module.getUpdatedAt());
    }
}
