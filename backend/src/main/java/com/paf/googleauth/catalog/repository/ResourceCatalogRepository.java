package com.paf.googleauth.catalog.repository;

import com.paf.googleauth.catalog.model.ResourceCatalogItem;
import com.paf.googleauth.catalog.model.ResourceCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceCatalogRepository extends MongoRepository<ResourceCatalogItem, String> {

    List<ResourceCatalogItem> findAllByCategoryOrderByNameAsc(ResourceCategory category);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);

    Optional<ResourceCatalogItem> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndCategoryIn(String name, List<ResourceCategory> categories);

    boolean existsByNameIgnoreCaseAndCategoryInAndLocationAndSublocation(
            String name,
            List<ResourceCategory> categories,
            String location,
            String sublocation);
}
