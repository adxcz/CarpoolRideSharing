import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUserFriends, 
  FaUser, 
  FaSignOutAlt, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaHistory,
  FaStar,
  FaTimes
} from 'react-icons/fa';
import { getCurrentUser, logoutUser } from '../../utils/authService';
import { getBookingsByPassenger, cancelBooking, BookingStatus } from '../../utils/bookingService';
import { getRideById, updateAvailableSeats } from '../../utils/rideService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import '../../styles/dashboard/dashboard.css';

const PassengerDashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.userType !== 'PASSENGER') {
      navigate('/login/passenger', { replace: true });
      return;
    }
    setUser(currentUser);
    loadBookings(currentUser.id);
  }, [navigate]);

  const loadBookings = (passengerId) => {
    const passengerBookings = getBookingsByPassenger(passengerId);
    setBookings(passengerBookings);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login/passenger');
  };

  const handleCancelBooking = (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      cancelBooking(bookingId, user.id, updateAvailableSeats);
      showSuccess('Booking cancelled successfully');
      loadBookings(user.id);
    } catch (err) {
      showError(err.message || 'Failed to cancel booking');
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

  const activeBookings = bookings.filter(b => 
    b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
  );
  const upcomingBookings = bookings.filter(b => 
    b.status === BookingStatus.CONFIRMED && new Date(getRideById(b.rideId)?.departureTime || 0) > new Date()
  );

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <FaUserFriends className="sidebar-logo" />
          <h2>Carpool App</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <FaUserFriends className="nav-icon" />
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <FaSearch className="nav-icon" />
            <span>Search Rides</span>
          </div>
          <div className="nav-item">
            <FaMapMarkerAlt className="nav-icon" />
            <span>My Bookings</span>
          </div>
          <div className="nav-item">
            <FaHistory className="nav-icon" />
            <span>Ride History</span>
          </div>
          <div className="nav-item">
            <FaStar className="nav-icon" />
            <span>Ratings</span>
          </div>
          <div className="nav-item">
            <FaCalendarAlt className="nav-icon" />
            <span>Upcoming Rides</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Passenger Dashboard</h1>
          <p>Welcome back, {user.name}!</p>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <FaMapMarkerAlt />
              </div>
              <div className="stat-info">
                <div className="stat-value">{activeBookings.length}</div>
                <div className="stat-label">Active Bookings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <FaHistory />
              </div>
              <div className="stat-info">
                <div className="stat-value">{bookings.length}</div>
                <div className="stat-label">Total Rides</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-yellow">
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <div className="stat-value">{upcomingBookings.length}</div>
                <div className="stat-label">Upcoming Rides</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <FaStar />
              </div>
              <div className="stat-info">
                <div className="stat-value">0</div>
                <div className="stat-label">Reviews Given</div>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <div className="section-header">
                <h2>My Bookings</h2>
                <Link to="/search-rides" className="primary-btn">
                  <FaSearch /> Search Rides
                </Link>
              </div>
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <FaMapMarkerAlt className="empty-icon" />
                  <p>No bookings yet. Search for rides to get started!</p>
                  <Link to="/search-rides" className="primary-btn">
                    Search Rides
                  </Link>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(booking => {
                    const ride = getRideById(booking.rideId);
                    if (!ride) return null;
                    return (
                      <div key={booking.id} className="booking-item">
                        <div className="booking-info">
                          <div className="booking-route">
                            <FaMapMarkerAlt className="location-icon start" />
                            <span>{ride.startLocation}</span>
                            <span className="arrow">→</span>
                            <FaMapMarkerAlt className="location-icon end" />
                            <span>{ride.endLocation}</span>
                          </div>
                          <div><strong>Status:</strong> {booking.status}</div>
                          <div><strong>Seats:</strong> {booking.numberOfSeats}</div>
                          <div><strong>Fare:</strong> ₱{booking.fare?.toFixed(2) || '0.00'}</div>
                          <div><strong>Departure:</strong> {formatDateTime(ride.departureTime)}</div>
                          {booking.notes && <div><strong>Notes:</strong> {booking.notes}</div>}
                        </div>
                        {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) && (
                          <button 
                            className="reject-btn" 
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <FaTimes /> Cancel
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <h2>Upcoming Rides</h2>
              {upcomingBookings.length === 0 ? (
                <div className="empty-state">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No upcoming rides scheduled.</p>
                </div>
              ) : (
                <div className="bookings-list">
                  {upcomingBookings.map(booking => {
                    const ride = getRideById(booking.rideId);
                    if (!ride) return null;
                    return (
                      <div key={booking.id} className="booking-item">
                        <div className="booking-info">
                          <div className="booking-route">
                            <FaMapMarkerAlt className="location-icon start" />
                            <span>{ride.startLocation}</span>
                            <span className="arrow">→</span>
                            <FaMapMarkerAlt className="location-icon end" />
                            <span>{ride.endLocation}</span>
                          </div>
                          <div><strong>Departure:</strong> {formatDateTime(ride.departureTime)}</div>
                          <div><strong>Seats:</strong> {booking.numberOfSeats}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default PassengerDashboard;

