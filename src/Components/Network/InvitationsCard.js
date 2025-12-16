// src/Components/Network/InvitationsCard.js
// import React, { useEffect, useState } from "react";

// export default function InvitationsCard({ API_BASE }) {
//   const [invitations, setInvitations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchInvitations();
//   }, []);

//   async function fetchInvitations() {
//     try {
//       const res = await fetch(`${API_BASE}/api/network/invitations`, {
//         credentials: "include",
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setInvitations(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch invitations:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="mynetwork-box">
//       <div className="mynetwork-box-header">
//         <span>
//           {loading
//             ? "Loading invitations..."
//             : invitations.length === 0
//             ? "No pending invitations"
//             : `${invitations.length} pending invitation${
//                 invitations.length > 1 ? "s" : ""
//               }`}
//         </span>
//         <span className="manage-link">Manage</span>
//       </div>
//     </div>
//   );
// }

// src/Components/Network/InvitationsCard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InvitationsCard({ API_BASE }) {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      const res = await fetch(`${API_BASE}/api/network/invitations`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleManageClick() {
    navigate("/mynetwork/invitations");
  }

  return (
    <div className="mynetwork-box">
      <div className="mynetwork-box-header">
        <span>
          {loading
            ? "Loading invitations..."
            : invitations.length === 0
            ? "No pending invitations"
            : `${invitations.length} pending invitation${
                invitations.length > 1 ? "s" : ""
              }`}
        </span>
        <span className="manage-link" onClick={handleManageClick}>
          Manage
        </span>
      </div>
    </div>
  );
}
