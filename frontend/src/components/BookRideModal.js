import React, { useState } from 'react';
import { FaTimes, FaUsers, FaStickyNote, FaDollarSign } from 'react-icons/fa';
import '../styles/components/book-ride-modal.css';

const BookRideModal = ({ ride, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    numberOfSeats: 1,
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfSeats' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const maxSeats = Math.min(ride.availableSeats, ride.availableSeats);
  // Calculate fare: Total price divided by number of passengers (excluding driver)
  // Use totalSeats (original seats) or availableSeats if totalSeats not available (backward compatibility)
  const totalSeats = ride.totalSeats || ride.availableSeats;
  const farePerSeat = ride.price / totalSeats;
  const totalFare = farePerSeat * formData.numberOfSeats;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Ride</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="ride-summary">
          <div className="summary-item">
            <strong>Route:</strong> {ride.startLocation} → {ride.endLocation}
          </div>
          <div className="summary-item">
            <strong>Departure:</strong> {new Date(ride.departureTime).toLocaleString()}
          </div>
          <div className="summary-item">
            <strong>Available Seats:</strong> {ride.availableSeats}
          </div>
          <div className="summary-item">
            <strong>Total Price:</strong> ₱{ride.price.toFixed(2)}
          </div>
          <div className="summary-item">
            <strong>Price per Passenger:</strong> ₱{((ride.totalSeats || ride.availableSeats) ? (ride.price / (ride.totalSeats || ride.availableSeats)).toFixed(2) : '0.00')}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>
              <FaUsers className="label-icon" />
              Number of Seats *
            </label>
            <input
              type="number"
              name="numberOfSeats"
              value={formData.numberOfSeats}
              onChange={handleChange}
              min="1"
              max={maxSeats}
              required
            />
            <small>Maximum: {ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''}</small>
          </div>

          <div className="form-group">
            <label>
              <FaStickyNote className="label-icon" />
              Special Requests (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requests or notes for the driver..."
              rows="4"
              maxLength="500"
            />
            <small>{formData.notes.length}/500 characters</small>
          </div>

          <div className="fare-summary">
            <div className="fare-item">
              <span>Fare per seat:</span>
              <span>₱{farePerSeat.toFixed(2)}</span>
            </div>
            <div className="fare-item total">
              <span>Total Fare:</span>
              <span>₱{totalFare.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookRideModal;

