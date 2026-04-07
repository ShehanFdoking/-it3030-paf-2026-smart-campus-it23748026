export const INCIDENT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const INCIDENT_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export const INCIDENT_CATEGORIES = [
  'Electrical',
  'Hardware',
  'Network',
  'Furniture',
  'Equipment Fault',
  'Other',
];

export const INCIDENT_CATEGORY_SUGGESTIONS = {
  LECTURE_HALL: [
    { name: 'Electrical Issues', examples: ['Lights not working', 'Power failure'] },
    { name: 'Audio/Visual Issues', examples: ['Projector not working', 'Microphone/speaker issues'] },
    { name: 'Air Conditioning / Ventilation', examples: ['AC not cooling', 'Poor ventilation'] },
    { name: 'Furniture Issues', examples: ['Broken chairs/desks'] },
    { name: 'Cleanliness / Housekeeping', examples: ['Dirty hall', 'Trash not cleared'] },
    { name: 'Structural Issues', examples: ['Ceiling leaks', 'Wall damage'] },
  ],
  MEETING_ROOM: [
    { name: 'Display / Screen Issues', examples: ['TV/monitor not working'] },
    { name: 'Audio Issues', examples: ['Conference mic not working'] },
    { name: 'Connectivity Issues', examples: ['Wi-Fi not working', 'HDMI/connection problems'] },
    { name: 'Furniture Issues', examples: ['Table/chairs damaged'] },
    { name: 'Environment Issues', examples: ['AC problems', 'Lighting problems'] },
  ],
  EQUIPMENT: [
    { name: 'Hardware Failure', examples: ['Device not turning on'] },
    { name: 'Performance Issues', examples: ['Slow / lagging'] },
    { name: 'Physical Damage', examples: ['Broken parts'] },
    { name: 'Battery / Power Issues', examples: ['Not charging'] },
    { name: 'Software Issues', examples: ['Errors', 'Crashes'] },
    { name: 'Missing / Lost', examples: ['Equipment not found'] },
  ],
};

export function getIncidentCategorySuggestions(resourceCategory) {
  const normalized = resourceCategory || '';
  return INCIDENT_CATEGORY_SUGGESTIONS[normalized] || INCIDENT_CATEGORIES.map((name) => ({
    name,
    examples: [],
  }));
}
