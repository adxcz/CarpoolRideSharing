import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaCar, 
  FaUser, 
  FaSignOutAlt, 
  FaRoute, 
  FaDollarSign, 
  FaStar,
  FaCalendarAlt,
  FaUsers,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import { getCurrentUser, logoutUser } from '../../utils/authService';
import { getRidesByDriver, deleteRide, getRideById } from '../../utils/rideService';
import { getBookingsForDriver, confirmBooking, rejectBooking, BookingStatus } from '../../utils/bookingService';
import { updateAvailableSeats } from '../../utils/rideService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import '../../styles/dashboard/dashboard.css';

const DriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.userType !== 'DRIVER') {
      navigate('/login/driver', { replace: true });
      return;
    }
    setUser(currentUser);
    loadData(currentUser.id);
  }, [navigate]);

  const loadData = (driverId) => {
    const driverRides = getRidesByDriver(driverId);
    const activeRides = driverRides.filter(ride => 
      ride.status === 'ACTIVE' && new Date(ride.departureTime) > new Date()
    );
    setRides(activeRides);

    const driverBookings = getBookingsForDriver(driverId, getRidesByDriver);
    setBookings(driverBookings);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login/driver');
  };

  const handleDeleteRide = (rideId) => {
    if (!window.confirm('Are you sure you want to delete this ride?')) {
      return;
    }

    try {
      deleteRide(rideId, user.id);
      showSuccess('Ride deleted successfully');
      loadData(user.id);
    } catch (err) {
      showError(err.message || 'Failed to delete ride');
    }
  };

  const handleConfirmBooking = (bookingId) => {
    try {
      confirmBooking(bookingId, user.id, getRideById);
      showSuccess('Booking confirmed successfully');
      loadData(user.id);
    } catch (err) {
      showError(err.message || 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) {
      return;
    }

    try {
      rejectBooking(bookingId, user.id, getRideById, updateAvailableSeats);
      showSuccess('Booking rejected');
      loadData(user.id);
    } catch (err) {
      showError(err.message || 'Failed to reject booking');
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

  const activeRidesCount = rides.length;
  const totalEarnings = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.fare || 0), 0);
  const totalPassengers = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.numberOfSeats || 0), 0);

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
          <FaCar className="sidebar-logo" />
          <h2>Carpool App</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <FaCar className="nav-icon" />
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <FaRoute className="nav-icon" />
            <span>My Rides</span>
          </div>
          <div className="nav-item">
            <FaUsers className="nav-icon" />
            <span>Passengers</span>
          </div>
          <div className="nav-item">
            <FaDollarSign className="nav-icon" />
            <span>Earnings</span>
          </div>
          <div className="nav-item">
            <FaStar className="nav-icon" />
            <span>Ratings</span>
          </div>
          <div className="nav-item">
            <FaCalendarAlt className="nav-icon" />
            <span>Schedule</span>
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
          <h1>Driver Dashboard</h1>
          <p>Welcome back, {user.name}!</p>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <FaRoute />
              </div>
              <div className="stat-info">
                <div className="stat-value">{activeRidesCount}</div>
                <div className="stat-label">Active Rides</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <FaDollarSign />
              </div>
              <div className="stat-info">
                <div className="stat-value">₱{totalEarnings.toFixed(2)}</div>
                <div className="stat-label">Total Earnings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-yellow">
                <FaUsers />
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalPassengers}</div>
                <div className="stat-label">Total Passengers</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <FaStar />
              </div>
              <div className="stat-info">
                <div className="stat-value">0.0</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <div className="section-header">
                <h2>My Rides</h2>
                <Link to="/create-ride" className="primary-btn">
                  <FaPlus /> Create Ride
                </Link>
              </div>
              {rides.length === 0 ? (
                <div className="empty-state">
                  <FaRoute className="empty-icon" />
                  <p>No rides yet. Start by creating your first ride!</p>
                  <Link to="/create-ride" className="primary-btn">
                    Create Ride
                  </Link>
                </div>
              ) : (
                <div className="rides-list">
                  {rides.map(ride => (
                    <div key={ride.id} className="ride-item">
                      <div className="ride-item-header">
                        <div className="ride-route">
                          <FaMapMarkerAlt className="location-icon start" />
                          <span>{ride.startLocation}</span>
                          <span className="arrow">→</span>
                          <FaMapMarkerAlt className="location-icon end" />
                          <span>{ride.endLocation}</span>
                        </div>
                        <div className="ride-actions">
                          <button className="icon-btn" onClick={() => navigate(`/edit-ride/${ride.id}`)}>
                            <FaEdit />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDeleteRide(ride.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="ride-item-details">
                        <div className="detail">
                          <FaCalendarAlt /> {formatDateTime(ride.departureTime)}
                        </div>
                        <div className="detail">
                          <FaUsers /> {ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} available
                        </div>
                        <div className="detail">
                          <FaDollarSign /> ₱{ride.price.toFixed(2)}
                        </div>
                        <div className="detail">
                          <FaClock /> {ride.duration} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <h2>Booking Requests</h2>
              {bookings.filter(b => b.status === 'PENDING').length === 0 ? (
                <div className="empty-state">
                  <FaUsers className="empty-icon" />
                  <p>No pending booking requests.</p>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.filter(b => b.status === 'PENDING').map(booking => (
                    <div key={booking.id} className="booking-item">
                      <div className="booking-info">
                        <div><strong>Seats:</strong> {booking.numberOfSeats}</div>
                        <div><strong>Fare:</strong> ₱{booking.fare?.toFixed(2) || '0.00'}</div>
                        {booking.notes && <div><strong>Notes:</strong> {booking.notes}</div>}
                      </div>
                      <div className="booking-actions">
                        <button 
                          className="confirm-btn"
                          onClick={() => handleConfirmBooking(booking.id)}
                        >
                          Confirm
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleRejectBooking(booking.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
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

export default DriverDashboard;

