export const BOOKING_STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
export const BOOKING_CATEGORY_OPTIONS = ['ALL', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT'];

export function createBookingRequestForm() {
  return {
    bookingDate: '',
    startTime: '08:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: '',
    linkedRoomApprovalCode: '',
  };
}

export function createBookingEditForm(booking) {
  return {
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    purpose: booking.purpose,
    expectedAttendees: booking.expectedAttendees || '',
    linkedRoomApprovalCode: '',
  };
}
