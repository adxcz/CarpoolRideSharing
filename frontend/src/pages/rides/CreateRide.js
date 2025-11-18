import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRoute, FaClock, FaDollarSign, FaStickyNote } from 'react-icons/fa';
import { createRide, calculatePrice } from '../../utils/rideService';
import { getCurrentUser } from '../../utils/authService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import '../../styles/rides/create-ride.css';

const CreateRide = () => {
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startLocation: '',
    endLocation: '',
    departureTime: '',
    availableSeats: 1,
    distance: '',
    duration: '',
    notes: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.userType !== 'DRIVER') {
      navigate('/driver/dashboard', { replace: true });
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ride = createRide({
        driverId: user.id,
        ...formData,
      });

      showSuccess('Ride created successfully!');
      
      setTimeout(() => {
        navigate('/driver/dashboard');
      }, 1500);
    } catch (err) {
      showError(err.message || 'Failed to create ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview price
  const previewPrice = formData.distance && formData.duration
    ? calculatePrice(parseFloat(formData.distance) || 0, parseInt(formData.duration) || 0)
    : 0;

  if (!user) {
    return null;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="create-ride-container">
        <div className="create-ride-header">
          <button className="back-button" onClick={() => navigate('/driver/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1>Create a New Ride</h1>
        </div>

        <div className="create-ride-content">
          <form onSubmit={handleSubmit} className="create-ride-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="label-icon" />
                  Start Location *
                </label>
                <input
                  type="text"
                  name="startLocation"
                  value={formData.startLocation}
                  onChange={handleChange}
                  placeholder="e.g., Manila"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="label-icon" />
                  End Location *
                </label>
                <input
                  type="text"
                  name="endLocation"
                  value={formData.endLocation}
                  onChange={handleChange}
                  placeholder="e.g., Quezon City"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaCalendarAlt className="label-icon" />
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaUsers className="label-icon" />
                  Available Seats *
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  min="1"
                  max="3"
                  required
                />
                <small>Minimum: 1, Maximum: 3</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaRoute className="label-icon" />
                  Distance (km) *
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  step="0.1"
                  min="0.1"
                  placeholder="e.g., 15.5"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaClock className="label-icon" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g., 30"
                  required
                />
              </div>
            </div>

            {formData.distance && formData.duration && (
              <div className="price-preview">
                <FaDollarSign className="price-icon" />
                <div>
                  <span className="price-label">Calculated Price:</span>
                  <span className="price-value">₱{previewPrice.toFixed(2)}</span>
                </div>
                <small>Formula: [Base Fare (₱30) + (Distance × ₱12/km) + (Duration × ₱1.50/min)] ÷ Number of Passengers</small>
              </div>
            )}

            <div className="form-group">
              <label>
                <FaStickyNote className="label-icon" />
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information about the ride..."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/driver/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Ride'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRide;

