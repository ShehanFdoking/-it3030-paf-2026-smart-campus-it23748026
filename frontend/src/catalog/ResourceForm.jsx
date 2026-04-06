import { useEffect, useState } from 'react';
import { listResources } from '../api';
import {
  DAY_SCOPE_OPTIONS,
  LOCATION_OPTIONS,
  RESOURCE_CATEGORIES,
  createEmptyResourceDraft,
  createEmptyWindow,
  getCategoryMeta,
  getSublocationOptions,
} from './resourceConfig';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'OUT_OF_SERVICE', label: 'OUT_OF_SERVICE' },
];

function normalizeAvailabilityWindows(windows) {
  return windows.map((window) => ({
    dayScope: window.dayScope,
    openTime: window.openTime,
    closeTime: window.closeTime,
  }));
}

export default function ResourceForm({ categorySlug, resource, busy, onCancel, onSubmit }) {
  const meta = getCategoryMeta(categorySlug);
  const [draft, setDraft] = useState(() => createEmptyResourceDraft(categorySlug));
  const [referenceOptions, setReferenceOptions] = useState([]);

  useEffect(() => {
    if (resource) {
      setDraft({
        category: resource.category || meta.enumValue,
        name: resource.name || '',
        capacity: resource.capacity ?? '',
        location: resource.location || createEmptyResourceDraft(categorySlug).location,
        sublocation: resource.sublocation || '',
        status: resource.status || 'ACTIVE',
        relatedResourceName: resource.relatedResourceName || '',
        availabilityWindows: resource.availabilityWindows?.length
          ? resource.availabilityWindows.map((window) => ({
              dayScope: window.dayScope || 'WEEKDAYS',
              openTime: window.openTime || '08:00',
              closeTime: window.closeTime || '18:00',
            }))
          : [createEmptyWindow()],
      });
    } else {
      setDraft(createEmptyResourceDraft(categorySlug));
    }
  }, [categorySlug, meta.enumValue, resource]);

  useEffect(() => {
    const loadReferenceOptions = async () => {
      if (categorySlug !== RESOURCE_CATEGORIES.equipment.slug) {
        setReferenceOptions([]);
        return;
      }

      try {
        const [lectureHalls, meetingRooms] = await Promise.all([
          listResources(RESOURCE_CATEGORIES.lectureHalls.enumValue),
          listResources(RESOURCE_CATEGORIES.meetingRooms.enumValue),
        ]);

        const names = new Set();
        [...lectureHalls, ...meetingRooms].forEach((item) => {
          if (item.name) {
            names.add(item.name);
          }
        });

        setReferenceOptions(Array.from(names).sort((left, right) => left.localeCompare(right)));
      } catch {
        setReferenceOptions([]);
      }
    };

    loadReferenceOptions();
  }, [categorySlug]);

  useEffect(() => {
    const options = getSublocationOptions(draft.location);
    if (!options.some((option) => option.value === draft.sublocation)) {
      setDraft((current) => ({
        ...current,
        sublocation: options[0]?.value || '',
      }));
    }
  }, [draft.location, draft.sublocation]);

  const updateField = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateWindow = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      availabilityWindows: current.availabilityWindows.map((window, windowIndex) => (
        windowIndex === index ? { ...window, [field]: value } : window
      )),
    }));
  };

  const addWindow = () => {
    setDraft((current) => ({
      ...current,
      availabilityWindows: [...current.availabilityWindows, createEmptyWindow()],
    }));
  };

  const removeWindow = (index) => {
    setDraft((current) => {
      const nextWindows = current.availabilityWindows.filter((_, windowIndex) => windowIndex !== index);
      return {
        ...current,
        availabilityWindows: nextWindows.length ? nextWindows : [createEmptyWindow()],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...draft,
      capacity: Number(draft.capacity),
      availabilityWindows: normalizeAvailabilityWindows(draft.availabilityWindows),
    });
  };

  const locationOptions = LOCATION_OPTIONS;
  const sublocationOptions = getSublocationOptions(draft.location);

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="resource-form__header">
        <div>
          <p className="resource-form__eyebrow">{meta.label}</p>
          <h3>{resource ? `Edit ${meta.itemLabel}` : `Add new ${meta.itemLabel}`}</h3>
        </div>
        <span className="resource-chip">Type: {meta.label}</span>
      </div>

      <div className="resource-grid">
        <label className="resource-field">
          <span>Name</span>
          <input
            className="input"
            value={draft.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder={`Enter ${meta.itemLabel} name`}
            required
          />
        </label>

        <label className="resource-field">
          <span>Capacity</span>
          <input
            className="input"
            type="number"
            min="1"
            value={draft.capacity}
            onChange={(event) => updateField('capacity', event.target.value)}
            placeholder="Enter capacity"
            required
          />
        </label>

        <label className="resource-field">
          <span>Location</span>
          <select
            className="input"
            value={draft.location}
            onChange={(event) => updateField('location', event.target.value)}
          >
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="resource-field">
          <span>Sublocation</span>
          <select
            className="input"
            value={draft.sublocation}
            onChange={(event) => updateField('sublocation', event.target.value)}
          >
            {sublocationOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="resource-field">
          <span>Status</span>
          <select
            className="input"
            value={draft.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        {categorySlug === RESOURCE_CATEGORIES.equipment.slug ? (
          <label className="resource-field resource-field--full">
            <span>Lecture hall / meeting room name</span>
            <input
              className="input"
              list="reference-resource-options"
              value={draft.relatedResourceName || ''}
              onChange={(event) => updateField('relatedResourceName', event.target.value)}
              placeholder="Select or type an existing lecture hall / meeting room name"
              required
            />
            <datalist id="reference-resource-options">
              {referenceOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>
        ) : null}
      </div>

      <div className="resource-windows">
        <div className="resource-windows__header">
          <div>
            <h4>Availability Windows</h4>
            <p>Choose the day scope and time slot for each window.</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={addWindow}>
            Add window
          </button>
        </div>

        {draft.availabilityWindows.map((window, index) => (
          <div key={`${index}-${window.dayScope}`} className="window-card">
            <div className="resource-grid resource-grid--window">
              <label className="resource-field">
                <span>Day scope</span>
                <select
                  className="input"
                  value={window.dayScope}
                  onChange={(event) => updateWindow(index, 'dayScope', event.target.value)}
                >
                  {DAY_SCOPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="resource-field">
                <span>Open time</span>
                <input
                  className="input"
                  type="time"
                  value={window.openTime}
                  onChange={(event) => updateWindow(index, 'openTime', event.target.value)}
                />
              </label>
              <label className="resource-field">
                <span>Close time</span>
                <input
                  className="input"
                  type="time"
                  value={window.closeTime}
                  onChange={(event) => updateWindow(index, 'closeTime', event.target.value)}
                />
              </label>
            </div>

            <div className="actions-row actions-row--tight">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => removeWindow(index)}
                disabled={draft.availabilityWindows.length === 1}
              >
                Remove window
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="actions-row">
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
