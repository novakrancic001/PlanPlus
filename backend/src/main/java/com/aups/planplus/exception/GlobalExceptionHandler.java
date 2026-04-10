package com.aups.planplus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Ova anotacija "prisluškuje" sve kontrolere
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> errorMap = new HashMap<>();
        errorMap.put("error", ex.getMessage());

        // Umesto 500, vraćamo 400 (Bad Request) jer je greška u podacima korisnika
        return new ResponseEntity<>(errorMap, HttpStatus.BAD_REQUEST);
    }
}