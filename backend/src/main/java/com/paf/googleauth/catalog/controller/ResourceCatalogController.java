package com.paf.googleauth.catalog.controller;

import com.paf.googleauth.catalog.dto.ResourceCatalogRequest;
import com.paf.googleauth.catalog.dto.ResourceCatalogResponse;
import com.paf.googleauth.catalog.model.ResourceCategory;
import com.paf.googleauth.catalog.service.ResourceCatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/resources")
public class ResourceCatalogController {

    private final ResourceCatalogService service;

    public ResourceCatalogController(ResourceCatalogService service) {
        this.service = service;
    }

    @GetMapping
    public List<ResourceCatalogResponse> list(
            @RequestParam(required = false) ResourceCategory category,
            @RequestParam(required = false) String sortBy) {
        return service.list(category, sortBy);
    }

    @GetMapping("/{id}")
    public ResourceCatalogResponse getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    public ResourceCatalogResponse create(
            @Valid @RequestBody ResourceCatalogRequest request,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        return service.create(request, adminEmail);
    }

    @PutMapping("/{id}")
    public ResourceCatalogResponse update(
            @PathVariable String id,
            @Valid @RequestBody ResourceCatalogRequest request,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        return service.update(id, request, adminEmail);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(
            @PathVariable String id,
            @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        service.delete(id, adminEmail);
        return Map.of("message", "Resource deleted successfully");
    }
}
