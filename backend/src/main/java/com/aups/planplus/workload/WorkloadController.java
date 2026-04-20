package com.aups.planplus.workload;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
@RequiredArgsConstructor
public class WorkloadController {

    private final WorkloadService workloadService;

    @GetMapping("/workload")
    @PreAuthorize("hasRole('PLANNER')")
    public List<OperatorWorkloadDTO> getWorkload() {
        return workloadService.getOperatorWorkload();
    }
}