package com.paf.googleauth.catalog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "resource_catalogue")
public class ResourceCatalogItem {

    @Id
    private String id;

    @Field("category")
    private ResourceCategory category;

    @Field("name")
    private String name;

    @Field("capacity")
    private Integer capacity;

    @Field("location")
    private String location;

    @Field("sublocation")
    private String sublocation;

    @Field("status")
    private ResourceStatus status;

    @Field("related_resource_name")
    private String relatedResourceName;

    @Field("equipment_type")
    private String equipmentType;

    @Field("availability_windows")
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    public ResourceCatalogItem() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ResourceCategory getCategory() {
        return category;
    }

    public void setCategory(ResourceCategory category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSublocation() {
        return sublocation;
    }

    public void setSublocation(String sublocation) {
        this.sublocation = sublocation;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public String getRelatedResourceName() {
        return relatedResourceName;
    }

    public void setRelatedResourceName(String relatedResourceName) {
        this.relatedResourceName = relatedResourceName;
    }

    public String getEquipmentType() {
        return equipmentType;
    }

    public void setEquipmentType(String equipmentType) {
        this.equipmentType = equipmentType;
    }

    public List<AvailabilityWindow> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<AvailabilityWindow> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }
}
