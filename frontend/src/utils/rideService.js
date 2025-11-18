const RIDES_STORAGE_KEY = 'carpool_rides';

// Initialize rides storage
const initializeRidesStorage = () => {
  if (!localStorage.getItem(RIDES_STORAGE_KEY)) {
    localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all rides from localStorage
const getRides = () => {
  initializeRidesStorage();
  const ridesJson = localStorage.getItem(RIDES_STORAGE_KEY);
  return JSON.parse(ridesJson || '[]');
};

// Save rides to localStorage
const saveRides = (rides) => {
  localStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(rides));
};

// Calculate price based on distance and duration
// Formula: Base Fare (₱30) + (Distance × ₱12/km) + (Duration × ₱1.50/min)
export const calculatePrice = (distance, duration) => {
  const baseFare = 30;
  const distanceRate = 12; // per km
  const durationRate = 1.50; // per minute
  return baseFare + (distance * distanceRate) + (duration * durationRate);
};

// Create a new ride
export const createRide = (rideData) => {
  const {
    driverId,
    startLocation,
    endLocation,
    departureTime,
    availableSeats,
    distance,
    duration,
    notes = ''
  } = rideData;

  // Validate inputs
  if (!startLocation || !endLocation || !departureTime || !availableSeats || !distance || !duration) {
    throw new Error('All required fields must be filled');
  }

  if (availableSeats < 1) {
    throw new Error('Available seats must be at least 1');
  }

  if (availableSeats > 3) {
    throw new Error('Available seats cannot exceed 3');
  }

  if (distance <= 0) {
    throw new Error('Distance must be positive');
  }

  if (duration <= 0) {
    throw new Error('Duration must be positive');
  }

  const departureDateTime = new Date(departureTime);
  if (departureDateTime <= new Date()) {
    throw new Error('Departure time must be in the future');
  }

  const rides = getRides();
  const totalSeats = parseInt(availableSeats);
  const totalPrice = calculatePrice(parseFloat(distance), parseInt(duration));
  
  const newRide = {
    id: Date.now().toString(),
    driverId,
    startLocation: startLocation.trim(),
    endLocation: endLocation.trim(),
    departureTime: departureDateTime.toISOString(),
    availableSeats: totalSeats,
    totalSeats: totalSeats, // Store original total seats for fare calculation
    distance: parseFloat(distance),
    duration: parseInt(duration),
    notes: notes.trim(),
    price: totalPrice, // Total cost of the ride
    pricePerPassenger: totalPrice / totalSeats, // Cost per passenger (excluding driver)
    status: 'ACTIVE', // ACTIVE, CANCELLED
    createdAt: new Date().toISOString(),
  };

  rides.push(newRide);
  saveRides(rides);

  return newRide;
};

// Get ride by ID
export const getRideById = (rideId) => {
  const rides = getRides();
  return rides.find(ride => ride.id === rideId) || null;
};

// Get rides by driver ID
export const getRidesByDriver = (driverId) => {
  const rides = getRides();
  return rides.filter(ride => ride.driverId === driverId);
};

// Update a ride
export const updateRide = (rideId, driverId, rideData) => {
  const rides = getRides();
  const rideIndex = rides.findIndex(ride => ride.id === rideId);

  if (rideIndex === -1) {
    throw new Error('Ride not found');
  }

  const ride = rides[rideIndex];

  // Verify ownership
  if (ride.driverId !== driverId) {
    throw new Error('You can only edit your own rides');
  }

  // Validate inputs
  const {
    startLocation,
    endLocation,
    departureTime,
    availableSeats,
    distance,
    duration,
    notes = ''
  } = rideData;

  if (availableSeats < 1) {
    throw new Error('Available seats must be at least 1');
  }

  if (availableSeats > 3) {
    throw new Error('Available seats cannot exceed 3');
  }

  if (distance <= 0) {
    throw new Error('Distance must be positive');
  }

  if (duration <= 0) {
    throw new Error('Duration must be positive');
  }

  const departureDateTime = new Date(departureTime);
  if (departureDateTime <= new Date()) {
    throw new Error('Departure time must be in the future');
  }

  // Update ride
  const totalSeats = parseInt(availableSeats);
  const totalPrice = calculatePrice(parseFloat(distance), parseInt(duration));
  
  rides[rideIndex] = {
    ...ride,
    startLocation: startLocation.trim(),
    endLocation: endLocation.trim(),
    departureTime: departureDateTime.toISOString(),
    availableSeats: totalSeats,
    totalSeats: totalSeats, // Update total seats
    distance: parseFloat(distance),
    duration: parseInt(duration),
    notes: notes.trim(),
    price: totalPrice, // Total cost of the ride
    pricePerPassenger: totalPrice / totalSeats, // Cost per passenger (excluding driver)
    updatedAt: new Date().toISOString(),
  };

  saveRides(rides);
  return rides[rideIndex];
};

// Delete a ride
export const deleteRide = (rideId, driverId) => {
  const rides = getRides();
  const rideIndex = rides.findIndex(ride => ride.id === rideId);

  if (rideIndex === -1) {
    throw new Error('Ride not found');
  }

  const ride = rides[rideIndex];

  // Verify ownership
  if (ride.driverId !== driverId) {
    throw new Error('You can only delete your own rides');
  }

  // Mark as cancelled instead of deleting (to preserve booking history)
  rides[rideIndex] = {
    ...ride,
    status: 'CANCELLED',
    cancelledAt: new Date().toISOString(),
  };

  saveRides(rides);
  return true;
};

// Search rides
export const searchRides = (filters) => {
  const {
    from = '',
    to = '',
    date = null,
    minPrice = null,
    maxPrice = null,
  } = filters;

  let rides = getRides();

  // Filter out cancelled rides and rides with no available seats
  rides = rides.filter(ride => 
    ride.status === 'ACTIVE' && 
    ride.availableSeats > 0 &&
    new Date(ride.departureTime) > new Date()
  );

  // Apply location filters (case-insensitive partial matching)
  if (from) {
    const fromLower = from.toLowerCase();
    rides = rides.filter(ride => 
      ride.startLocation.toLowerCase().includes(fromLower)
    );
  }

  if (to) {
    const toLower = to.toLowerCase();
    rides = rides.filter(ride => 
      ride.endLocation.toLowerCase().includes(toLower)
    );
  }

  // Apply date filter
  if (date) {
    const filterDate = new Date(date);
    filterDate.setHours(0, 0, 0, 0);
    rides = rides.filter(ride => {
      const rideDate = new Date(ride.departureTime);
      rideDate.setHours(0, 0, 0, 0);
      return rideDate >= filterDate;
    });
  }

  // Apply price filters
  if (minPrice !== null && minPrice !== '') {
    const min = parseFloat(minPrice);
    rides = rides.filter(ride => ride.price >= min);
  }

  if (maxPrice !== null && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    rides = rides.filter(ride => ride.price <= max);
  }

  // Sort by departure time (earliest first)
  rides.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

  return rides;
};

// Get all available rides (for display)
export const getAvailableRides = () => {
  return searchRides({});
};

// Update available seats when booking is made/cancelled
export const updateAvailableSeats = (rideId, seatsChange) => {
  const rides = getRides();
  const rideIndex = rides.findIndex(ride => ride.id === rideId);

  if (rideIndex === -1) {
    throw new Error('Ride not found');
  }

  const ride = rides[rideIndex];
  const newAvailableSeats = ride.availableSeats + seatsChange;

  if (newAvailableSeats < 0) {
    throw new Error('Not enough available seats');
  }

  rides[rideIndex] = {
    ...ride,
    availableSeats: newAvailableSeats,
  };

  saveRides(rides);
  return rides[rideIndex];
};

