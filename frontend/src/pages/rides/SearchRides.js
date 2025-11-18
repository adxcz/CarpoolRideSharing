import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaUsers, FaClock, FaTimes, FaRoute } from 'react-icons/fa';
import { searchRides, getRideById } from '../../utils/rideService';
import { getCurrentUser } from '../../utils/authService';
import { createBooking } from '../../utils/bookingService';
import { updateAvailableSeats } from '../../utils/rideService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import BookRideModal from '../../components/BookRideModal';
import '../../styles/rides/search-rides.css';

const SearchRides = () => {
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.userType !== 'PASSENGER') {
      navigate('/passenger/dashboard', { replace: true });
      return;
    }
    setUser(currentUser);
    loadRides();
  }, [navigate]);

  const loadRides = () => {
    const results = searchRides(filters);
    setRides(results);
  };

  useEffect(() => {
    if (user) {
      loadRides();
    }
  }, [filters, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      from: '',
      to: '',
      date: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const handleBookRide = (ride) => {
    setSelectedRide(ride);
    setShowBookModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      createBooking(
        {
          rideId: selectedRide.id,
          passengerId: user.id,
          ...bookingData,
        },
        getRideById,
        updateAvailableSeats
      );

      showSuccess('Booking request submitted successfully!');
      setShowBookModal(false);
      setSelectedRide(null);
      loadRides(); // Refresh rides to update available seats
    } catch (err) {
      showError(err.message || 'Failed to create booking. Please try again.');
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="search-rides-container">
        <div className="search-rides-header">
          <h1>Search for Rides</h1>
          <p>Find your perfect carpool ride</p>
        </div>

        <div className="search-filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <FaMapMarkerAlt className="filter-icon" />
              <input
                type="text"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
                placeholder="From location"
              />
            </div>

            <div className="filter-group">
              <FaMapMarkerAlt className="filter-icon" />
              <input
                type="text"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
                placeholder="To location"
              />
            </div>

            <div className="filter-group">
              <FaCalendarAlt className="filter-icon" />
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <FaDollarSign className="filter-icon" />
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min price"
                min="0"
                step="0.01"
              />
            </div>

            <div className="filter-group">
              <FaDollarSign className="filter-icon" />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max price"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {(filters.from || filters.to || filters.date || filters.minPrice || filters.maxPrice) && (
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              <FaTimes /> Reset Filters
            </button>
          )}
        </div>

        <div className="rides-results">
          {loading ? (
            <div className="loading-state">Loading rides...</div>
          ) : rides.length === 0 ? (
            <div className="empty-state">
              <FaSearch className="empty-icon" />
              <h3>No rides found</h3>
              <p>No rides found matching your criteria. Try adjusting your search filters.</p>
              {(filters.from || filters.to || filters.date || filters.minPrice || filters.maxPrice) && (
                <button className="reset-btn" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>Found {rides.length} ride{rides.length !== 1 ? 's' : ''}</h2>
              </div>
              <div className="rides-list">
                {rides.map(ride => (
                  <div key={ride.id} className="ride-card">
                    <div className="ride-header">
                      <div className="ride-locations">
                        <div className="location-item">
                          <FaMapMarkerAlt className="location-icon start" />
                          <span>{ride.startLocation}</span>
                        </div>
                        <div className="location-arrow">→</div>
                        <div className="location-item">
                          <FaMapMarkerAlt className="location-icon end" />
                          <span>{ride.endLocation}</span>
                        </div>
                      </div>
                      <div className="ride-price">₱{ride.price.toFixed(2)}</div>
                    </div>

                    <div className="ride-details">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>{formatDateTime(ride.departureTime)}</span>
                      </div>
                      <div className="detail-item">
                        <FaUsers className="detail-icon" />
                        <span>{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} available</span>
                      </div>
                      <div className="detail-item">
                        <FaRoute className="detail-icon" />
                        <span>{ride.distance} km</span>
                      </div>
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span>{ride.duration} min</span>
                      </div>
                    </div>

                    {ride.notes && (
                      <div className="ride-notes">
                        <strong>Notes:</strong> {ride.notes}
                      </div>
                    )}

                    <button
                      className="book-btn"
                      onClick={() => handleBookRide(ride)}
                      disabled={ride.availableSeats === 0}
                    >
                      Book Ride
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showBookModal && selectedRide && (
        <BookRideModal
          ride={selectedRide}
          onClose={() => {
            setShowBookModal(false);
            setSelectedRide(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}
    </>
  );
};

export default SearchRides;

