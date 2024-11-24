import React, { useState } from "react";
import "../styling/raiseIssue.css";
import axios from "axios";

const RaiseIssueModal = ({ userData, onClose }) => {
  console.log(userData.userData._id);
  const [issueMessage, setIssueMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!issueMessage.trim()) {
      setError("Please enter a message.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/issues", {
        user: userData.userData._id,
        email: userData.userData.email,
        message: issueMessage,
      });

      if (response.status === 201) {
        setSuccess("Issue raised successfully.");
        setError("");
        setIssueMessage(""); // Clear the input
      }
    } catch (error) {
      setError("Failed to raise issue. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Raise an Issue</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <textarea
          placeholder="Describe your issue..."
          value={issueMessage}
          onChange={(e) => setIssueMessage(e.target.value)}
          className="issue-textarea"
        />
        <div className="modal-actions">
          <button onClick={handleSubmit} className="submit-button">
            Submit
          </button>
          <button onClick={onClose} className="cancel-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaiseIssueModal;
