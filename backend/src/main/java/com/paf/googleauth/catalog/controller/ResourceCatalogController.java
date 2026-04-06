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
    public List<ResourceCatalogResponse> list(@RequestParam(required = false) ResourceCategory category) {
        return service.list(category);
    }

    @GetMapping("/{id}")
    public ResourceCatalogResponse getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    public ResourceCatalogResponse create(@Valid @RequestBody ResourceCatalogRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ResourceCatalogResponse update(@PathVariable String id, @Valid @RequestBody ResourceCatalogRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable String id) {
        service.delete(id);
        return Map.of("message", "Resource deleted successfully");
    }
}
