package com.aups.planplus.workload;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/operators")
@RequiredArgsConstructor
public class WorkloadController {

    private final WorkloadService workloadService;

    @GetMapping("/workload")
    @PreAuthorize("hasRole('PLANNER')")
    public List<OperatorWorkloadDTO> getWorkload(
            @RequestParam(defaultValue = "desc") String sort) {
        List<OperatorWorkloadDTO> result = workloadService.getOperatorWorkload();
        Comparator<OperatorWorkloadDTO> comparator = Comparator.comparingInt(OperatorWorkloadDTO::getActiveOrders);
        return "asc".equalsIgnoreCase(sort)
                ? result.stream().sorted(comparator).toList()
                : result.stream().sorted(comparator.reversed()).toList();
    }
}