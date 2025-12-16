// src/Components/Network/ManageInvitations.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, X, Check } from "lucide-react";
import { useToast } from "../../Contexts/ToastContext";
import "./ManageInvitations.css";

export default function ManageInvitations({ API_BASE }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("received");
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked) {
      loadInvitations();
    }
  }, [authChecked]);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/me`, {
        credentials: "include",
      });

      if (!r.ok) {
        addToast("Please login to access invitations", { type: "error" });
        navigate("/Login");
        return;
      }

      setAuthChecked(true);
    } catch (err) {
      console.error("Auth check failed:", err);
      addToast("Please login to continue", { type: "error" });
      navigate("/Login");
    }
  }

  async function loadInvitations() {
    setLoading(true);
    try {
      // Fetch received invitations
      const receivedRes = await fetch(`${API_BASE}/api/network/invitations`, {
        credentials: "include",
      });
      if (receivedRes.ok) {
        const receivedData = await receivedRes.json();
        setReceivedInvitations(receivedData);
      }

      // Fetch sent invitations
      const sentRes = await fetch(`${API_BASE}/api/network/sent-invitations`, {
        credentials: "include",
      });
      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentInvitations(sentData);
      }
    } catch (err) {
      console.error("Failed to load invitations:", err);
      addToast("Failed to load invitations", { type: "error" });
    }
    setLoading(false);
  }

  async function handleAccept(connectionId, requesterId) {
    try {
      const res = await fetch(`${API_BASE}/api/network/accept-by-requester`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requesterId }),
      });

      if (res.ok) {
        addToast("Connection accepted!", { type: "success" });
        setReceivedInvitations((prev) =>
          prev.filter((inv) => inv.requester_id !== requesterId)
        );
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to accept connection", {
          type: "error",
        });
      }
    } catch (err) {
      console.error("Failed to accept connection:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  async function handleIgnore(requesterId) {
    try {
      const res = await fetch(`${API_BASE}/api/network/reject-by-requester`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requesterId }),
      });

      if (res.ok) {
        addToast("Invitation ignored", { type: "success" });
        setReceivedInvitations((prev) =>
          prev.filter((inv) => inv.requester_id !== requesterId)
        );
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to ignore invitation", {
          type: "error",
        });
      }
    } catch (err) {
      console.error("Failed to ignore invitation:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  async function handleWithdraw(receiverId) {
    try {
      const res = await fetch(`${API_BASE}/api/network/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId }),
      });

      if (res.ok) {
        addToast("Invitation withdrawn", { type: "success" });
        setSentInvitations((prev) =>
          prev.filter((inv) => inv.receiver_id !== receiverId)
        );
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to withdraw invitation", {
          type: "error",
        });
      }
    } catch (err) {
      console.error("Failed to withdraw invitation:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  if (!authChecked) return null;

  const currentInvitations =
    activeTab === "received" ? receivedInvitations : sentInvitations;

  return (
    <div className="manage-invitations-page">
      <div className="manage-invitations-container">
        {/* Header */}
        <div className="manage-invitations-header">
          <h1>Manage invitations</h1>
          <button
            className="settings-btn"
            aria-label="Settings"
            style={{ width: "50px" }}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="manage-invitations-tabs">
          <button
            className={`tab-btn ${activeTab === "received" ? "active" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            Received
          </button>
          <button
            className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent
          </button>
        </div>

        {/* Filter button */}
        <div className="filter-section">
          <button className="filter-btn">
            All ({currentInvitations.length})
          </button>
        </div>

        {/* Content */}
        <div className="invitations-content">
          {loading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : currentInvitations.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://static.licdn.com/aero-v1/sc/h/djzv59yelk5urv2ujlazfyvrk"
                alt="No invitations"
                className="empty-illustration"
              />
              <h2>No new invitations</h2>
            </div>
          ) : (
            <div className="invitations-list">
              {activeTab === "received" &&
                receivedInvitations.map((invitation) => (
                  <ReceivedInvitationCard
                    key={invitation.requester_id}
                    invitation={invitation}
                    onAccept={handleAccept}
                    onIgnore={handleIgnore}
                    API_BASE={API_BASE}
                  />
                ))}

              {activeTab === "sent" &&
                sentInvitations.map((invitation) => (
                  <SentInvitationCard
                    key={invitation.receiver_id}
                    invitation={invitation}
                    onWithdraw={handleWithdraw}
                    API_BASE={API_BASE}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Received Invitation Card Component
function ReceivedInvitationCard({ invitation, onAccept, onIgnore, API_BASE }) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isIgnoring, setIsIgnoring] = useState(false);

  const avatar = invitation.avatar_url
    ? `${API_BASE}${invitation.avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  async function handleAcceptClick() {
    setIsAccepting(true);
    await onAccept(invitation.id, invitation.requester_id);
    setIsAccepting(false);
  }

  async function handleIgnoreClick() {
    setIsIgnoring(true);
    await onIgnore(invitation.requester_id);
    setIsIgnoring(false);
  }

  return (
    <div className="invitation-card">
      <img src={avatar} alt={invitation.name} className="invitation-avatar" />

      <div className="invitation-info">
        <h3 className="invitation-name">{invitation.name}</h3>
        <p className="invitation-title">{invitation.title || "Professional"}</p>
        <p className="invitation-time">
          {new Date(invitation.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="invitation-actions">
        <button
          className="ignore-btn"
          onClick={handleIgnoreClick}
          disabled={isIgnoring || isAccepting}
        >
          Ignore
        </button>
        <button
          className="accept-btn"
          onClick={handleAcceptClick}
          disabled={isAccepting || isIgnoring}
        >
          {isAccepting ? "Accepting..." : "Accept"}
        </button>
      </div>
    </div>
  );
}

// Sent Invitation Card Component
function SentInvitationCard({ invitation, onWithdraw, API_BASE }) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const avatar = invitation.avatar_url
    ? `${API_BASE}${invitation.avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  async function handleWithdrawClick() {
    setIsWithdrawing(true);
    await onWithdraw(invitation.receiver_id);
    setIsWithdrawing(false);
  }

  return (
    <div className="invitation-card">
      <img src={avatar} alt={invitation.name} className="invitation-avatar" />

      <div className="invitation-info">
        <h3 className="invitation-name">{invitation.name}</h3>
        <p className="invitation-title">{invitation.title || "Professional"}</p>
        <p className="invitation-time">
          Sent on {new Date(invitation.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="invitation-actions">
        <button
          className="withdraw-btn"
          onClick={handleWithdrawClick}
          disabled={isWithdrawing}
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
