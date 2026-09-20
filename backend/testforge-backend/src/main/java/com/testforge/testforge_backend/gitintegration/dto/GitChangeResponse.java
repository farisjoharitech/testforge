package com.testforge.testforge_backend.gitintegration.dto;
import java.util.List;
public record GitChangeResponse(List<String> added,List<String> modified,List<String> deleted,boolean hasChanges) { }
