export function toNullableNumber(value) {
  return value === '' || value == null ? null : Number(value);
}

export function mapBookingsByCategory(bookings) {
  return {
    LECTURE_HALL: bookings.filter((item) => item.resourceCategory === 'LECTURE_HALL'),
    MEETING_ROOM: bookings.filter((item) => item.resourceCategory === 'MEETING_ROOM'),
    EQUIPMENT: bookings.filter((item) => item.resourceCategory === 'EQUIPMENT'),
  };
}
