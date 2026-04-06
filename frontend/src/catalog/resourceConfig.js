export const RESOURCE_CATEGORIES = {
  lectureHalls: {
    slug: 'lecture-halls',
    enumValue: 'LECTURE_HALL',
    label: 'Lecture Halls',
    itemLabel: 'lecture hall',
    route: '/admin/resources/lecture-halls',
    description: 'Manage lecture halls, capacity, and timetable windows.',
  },
  meetingRooms: {
    slug: 'meeting-rooms',
    enumValue: 'MEETING_ROOM',
    label: 'Meeting Rooms',
    itemLabel: 'meeting room',
    route: '/admin/resources/meeting-rooms',
    description: 'Manage rooms for meetings, seminars, and sessions.',
  },
  equipment: {
    slug: 'equipment',
    enumValue: 'EQUIPMENT',
    label: 'Equipment',
    itemLabel: 'equipment',
    route: '/admin/resources/equipment',
    description: 'Manage shared equipment and its availability windows.',
  },
};

export const RESOURCE_CATEGORY_LIST = Object.values(RESOURCE_CATEGORIES);

export const LOCATION_OPTIONS = [
  { value: 'NEW_BUILDING', label: 'New Building' },
  { value: 'MAIN_BUILDING', label: 'Main Building' },
  { value: 'BUSINESS_FACULTY_BUILDING', label: 'Business Faculty Building' },
  { value: 'ENGINEERING_FACULTY_BUILDING', label: 'Engineering Faculty Building' },
];

export const DAY_SCOPE_OPTIONS = [
  { value: 'WEEKDAYS', label: 'Weekdays' },
  { value: 'WEEKENDS', label: 'Weekends' },
  { value: 'BOTH', label: 'Weekdays and Weekends' },
];

const FLOOR_OPTIONS = (count) => Array.from({ length: count }, (_, index) => ({
  value: `${index + 1}${ordinalSuffix(index + 1)}`,
  label: `${index + 1}${ordinalSuffix(index + 1)} Floor`,
}));

function ordinalSuffix(value) {
  const lastDigit = value % 10;
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return 'th';
  }
  if (lastDigit === 1) return 'st';
  if (lastDigit === 2) return 'nd';
  if (lastDigit === 3) return 'rd';
  return 'th';
}

const BASE_SUBLOCATION_MAP = {
  NEW_BUILDING: [
    { value: 'NEW_LIBRARY', label: 'New Library' },
    ...FLOOR_OPTIONS(14),
  ],
  MAIN_BUILDING: FLOOR_OPTIONS(9),
  BUSINESS_FACULTY_BUILDING: FLOOR_OPTIONS(6),
  ENGINEERING_FACULTY_BUILDING: FLOOR_OPTIONS(6),
};

export function getCategoryMeta(slug) {
  return RESOURCE_CATEGORY_LIST.find((category) => category.slug === slug) || RESOURCE_CATEGORIES.lectureHalls;
}

export function getLocationLabel(value) {
  return LOCATION_OPTIONS.find((option) => option.value === value)?.label || value;
}

export function getSublocationOptions(location) {
  return BASE_SUBLOCATION_MAP[location] || [];
}

export function getDefaultLocation() {
  return LOCATION_OPTIONS[0].value;
}

export function getDefaultSublocation(location = getDefaultLocation()) {
  return getSublocationOptions(location)[0]?.value || '';
}

export function createEmptyWindow() {
  return {
    dayScope: 'WEEKDAYS',
    openTime: '08:00',
    closeTime: '18:00',
  };
}

export function createEmptyResourceDraft(categorySlug) {
  const meta = getCategoryMeta(categorySlug);
  const location = getDefaultLocation();

  return {
    category: meta.enumValue,
    name: '',
    capacity: '',
    location,
    sublocation: getDefaultSublocation(location),
    status: 'ACTIVE',
    relatedResourceName: '',
    availabilityWindows: [createEmptyWindow()],
  };
}

export function formatWindow(window) {
  return `${window.dayScope} | ${window.openTime} - ${window.closeTime}`;
}
