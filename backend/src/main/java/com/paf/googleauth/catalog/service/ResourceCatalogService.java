package com.paf.googleauth.catalog.service;

import com.paf.googleauth.catalog.dto.AvailabilityWindowRequest;
import com.paf.googleauth.catalog.dto.AvailabilityWindowResponse;
import com.paf.googleauth.catalog.dto.ResourceCatalogRequest;
import com.paf.googleauth.catalog.dto.ResourceCatalogResponse;
import com.paf.googleauth.catalog.model.AvailabilityWindow;
import com.paf.googleauth.catalog.model.ResourceCatalogItem;
import com.paf.googleauth.catalog.model.ResourceCategory;
import com.paf.googleauth.catalog.model.ResourceStatus;
import com.paf.googleauth.catalog.repository.ResourceCatalogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResourceCatalogService {

    private final ResourceCatalogRepository repository;

    public ResourceCatalogService(ResourceCatalogRepository repository) {
        this.repository = repository;
    }

    public List<ResourceCatalogResponse> list(ResourceCategory category) {
        List<ResourceCatalogItem> items = category == null
                ? repository.findAll()
                : repository.findAllByCategoryOrderByNameAsc(category);

        return items.stream().map(this::toResponse).toList();
    }

    public ResourceCatalogResponse getById(String id) {
        return toResponse(findRequired(id));
    }

    public ResourceCatalogResponse create(ResourceCatalogRequest request) {
        validateDuplicateName(request.name(), null);
        ResourceCatalogItem item = new ResourceCatalogItem();
        applyRequest(item, request);
        return toResponse(repository.save(item));
    }

    public ResourceCatalogResponse update(String id, ResourceCatalogRequest request) {
        ResourceCatalogItem item = findRequired(id);
        validateDuplicateName(request.name(), id);
        applyRequest(item, request);
        return toResponse(repository.save(item));
    }

    public void delete(String id) {
        ResourceCatalogItem item = findRequired(id);
        repository.delete(item);
    }

    private ResourceCatalogItem findRequired(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    private void validateDuplicateName(String name, String currentId) {
        boolean exists = currentId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, currentId);

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A resource with this name already exists");
        }
    }

    private void applyRequest(ResourceCatalogItem item, ResourceCatalogRequest request) {
        validateRelatedResourceName(request);
        item.setCategory(request.category());
        item.setName(request.name().trim());
        item.setCapacity(request.capacity());
        item.setLocation(request.location());
        item.setSublocation(request.sublocation());
        item.setStatus(request.status() == null ? ResourceStatus.ACTIVE : request.status());
        item.setRelatedResourceName(normalizeRelatedResourceName(request));
        item.setAvailabilityWindows(toWindows(request.availabilityWindows()));
    }

    private void validateRelatedResourceName(ResourceCatalogRequest request) {
        String relatedResourceName = normalizeRelatedResourceName(request);
        if (request.category() != ResourceCategory.EQUIPMENT) {
            return;
        }

        if (relatedResourceName == null || relatedResourceName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Equipment must reference an existing lecture hall or meeting room name");
        }

        boolean exists = repository.existsByNameIgnoreCaseAndCategoryIn(
                relatedResourceName,
                List.of(ResourceCategory.LECTURE_HALL, ResourceCategory.MEETING_ROOM));

        if (!exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Referenced lecture hall or meeting room does not exist");
        }
    }

    private String normalizeRelatedResourceName(ResourceCatalogRequest request) {
        return request.relatedResourceName() == null ? null : request.relatedResourceName().trim();
    }

    private List<AvailabilityWindow> toWindows(List<AvailabilityWindowRequest> availabilityWindows) {
        List<AvailabilityWindow> windows = new ArrayList<>();
        if (availabilityWindows == null) {
            return windows;
        }

        for (AvailabilityWindowRequest window : availabilityWindows) {
            windows.add(new AvailabilityWindow(window.dayScope(), window.openTime(), window.closeTime()));
        }
        return windows;
    }

    private ResourceCatalogResponse toResponse(ResourceCatalogItem item) {
        List<AvailabilityWindowResponse> windows = item.getAvailabilityWindows() == null
                ? List.of()
                : item.getAvailabilityWindows().stream()
                        .map(window -> new AvailabilityWindowResponse(
                                window.getDayScope(),
                                window.getOpenTime(),
                                window.getCloseTime()))
                        .toList();

        return new ResourceCatalogResponse(
                item.getId(),
                item.getCategory(),
                item.getCategory() == null ? null : item.getCategory().getDisplayName(),
                item.getName(),
                item.getCapacity(),
                item.getLocation(),
                item.getSublocation(),
                item.getStatus(),
                item.getRelatedResourceName(),
                windows);
    }
}
