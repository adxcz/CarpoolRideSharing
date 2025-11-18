const BOOKINGS_STORAGE_KEY = 'carpool_bookings';
const PAYMENTS_STORAGE_KEY = 'carpool_payments';

// Booking statuses
export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Payment statuses
export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
};

// Initialize storage
const initializeStorage = () => {
  if (!localStorage.getItem(BOOKINGS_STORAGE_KEY)) {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(PAYMENTS_STORAGE_KEY)) {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all bookings
const getBookings = () => {
  initializeStorage();
  const bookingsJson = localStorage.getItem(BOOKINGS_STORAGE_KEY);
  return JSON.parse(bookingsJson || '[]');
};

// Save bookings
const saveBookings = (bookings) => {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
};

// Get all payments
const getPayments = () => {
  initializeStorage();
  const paymentsJson = localStorage.getItem(PAYMENTS_STORAGE_KEY);
  return JSON.parse(paymentsJson || '[]');
};

// Save payments
const savePayments = (payments) => {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
};

// Create a booking
export const createBooking = (bookingData, getRideById, updateAvailableSeats) => {
  const {
    rideId,
    passengerId,
    numberOfSeats,
    notes = ''
  } = bookingData;

  // Validate inputs
  if (!rideId || !passengerId || !numberOfSeats) {
    throw new Error('All required fields must be filled');
  }

  if (numberOfSeats < 1) {
    throw new Error('At least 1 seat must be booked');
  }

  if (notes && notes.length > 500) {
    throw new Error('Notes cannot exceed 500 characters');
  }

  // Get ride to check availability
  const ride = getRideById(rideId);

  if (!ride) {
    throw new Error('Ride not found');
  }

  if (ride.status !== 'ACTIVE') {
    throw new Error('Ride is not available');
  }

  if (ride.availableSeats < numberOfSeats) {
    throw new Error(`Only ${ride.availableSeats} seat(s) available`);
  }

  const bookings = getBookings();
  const payments = getPayments();

  // Calculate fare: Total price divided by number of passengers (excluding driver)
  // Use totalSeats (original seats) or availableSeats if totalSeats not available (backward compatibility)
  const totalSeats = ride.totalSeats || ride.availableSeats;
  const farePerSeat = ride.price / totalSeats;
  const totalFare = farePerSeat * numberOfSeats;

  // Create booking
  const newBooking = {
    id: Date.now().toString(),
    rideId,
    passengerId,
    numberOfSeats: parseInt(numberOfSeats),
    notes: notes.trim(),
    status: BookingStatus.PENDING,
    fare: totalFare,
    bookingTime: new Date().toISOString(),
  };

  bookings.push(newBooking);
  saveBookings(bookings);

  // Create payment record
  const newPayment = {
    id: Date.now().toString() + '_payment',
    bookingId: newBooking.id,
    rideId,
    passengerId,
    amount: totalFare,
    status: PaymentStatus.PENDING,
    createdAt: new Date().toISOString(),
  };

  payments.push(newPayment);
  savePayments(payments);

  // Update available seats
  updateAvailableSeats(rideId, -numberOfSeats);

  return { booking: newBooking, payment: newPayment };
};

// Get booking by ID
export const getBookingById = (bookingId) => {
  const bookings = getBookings();
  return bookings.find(booking => booking.id === bookingId) || null;
};

// Get bookings by passenger ID
export const getBookingsByPassenger = (passengerId) => {
  const bookings = getBookings();
  return bookings.filter(booking => booking.passengerId === passengerId);
};

// Get bookings by ride ID
export const getBookingsByRide = (rideId) => {
  const bookings = getBookings();
  return bookings.filter(booking => booking.rideId === rideId);
};

// Cancel a booking
export const cancelBooking = (bookingId, passengerId, updateAvailableSeats) => {
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);

  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }

  const booking = bookings[bookingIndex];

  // Verify ownership
  if (booking.passengerId !== passengerId) {
    throw new Error('You can only cancel your own bookings');
  }

  // Check if booking can be cancelled
  if (booking.status === BookingStatus.CANCELLED) {
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new Error('Cannot cancel a completed booking');
  }

  // Update booking status
  bookings[bookingIndex] = {
    ...booking,
    status: BookingStatus.CANCELLED,
    cancelledAt: new Date().toISOString(),
  };

  saveBookings(bookings);

  // Update payment status
  const payments = getPayments();
  const paymentIndex = payments.findIndex(payment => payment.bookingId === bookingId);
  if (paymentIndex !== -1) {
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date().toISOString(),
    };
    savePayments(payments);
  }

  // Restore available seats
  updateAvailableSeats(booking.rideId, booking.numberOfSeats);

  return bookings[bookingIndex];
};

// Confirm booking (driver action)
export const confirmBooking = (bookingId, driverId, getRideById) => {
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);

  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }

  const booking = bookings[bookingIndex];

  // Verify driver owns the ride
  const ride = getRideById(booking.rideId);

  if (!ride || ride.driverId !== driverId) {
    throw new Error('You can only confirm bookings for your own rides');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new Error('Only pending bookings can be confirmed');
  }

  // Update booking status
  bookings[bookingIndex] = {
    ...booking,
    status: BookingStatus.CONFIRMED,
    confirmedAt: new Date().toISOString(),
  };

  saveBookings(bookings);

  return bookings[bookingIndex];
};

// Reject booking (driver action)
export const rejectBooking = (bookingId, driverId, getRideById, updateAvailableSeats) => {
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);

  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }

  const booking = bookings[bookingIndex];

  // Verify driver owns the ride
  const ride = getRideById(booking.rideId);

  if (!ride || ride.driverId !== driverId) {
    throw new Error('You can only reject bookings for your own rides');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new Error('Only pending bookings can be rejected');
  }

  // Update booking status
  bookings[bookingIndex] = {
    ...booking,
    status: BookingStatus.CANCELLED,
    cancelledAt: new Date().toISOString(),
    rejectedByDriver: true,
  };

  saveBookings(bookings);

  // Update payment status
  const payments = getPayments();
  const paymentIndex = payments.findIndex(payment => payment.bookingId === bookingId);
  if (paymentIndex !== -1) {
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date().toISOString(),
    };
    savePayments(payments);
  }

  // Restore available seats
  updateAvailableSeats(booking.rideId, booking.numberOfSeats);

  return bookings[bookingIndex];
};

// Get bookings for driver's rides
export const getBookingsForDriver = (driverId, getRidesByDriver) => {
  const bookings = getBookings();
  const driverRides = getRidesByDriver(driverId);
  const rideIds = driverRides.map(ride => ride.id);

  return bookings.filter(booking => rideIds.includes(booking.rideId));
};

