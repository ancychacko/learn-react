// src/Components/Network/MyNetworkCard.js
// import React, { useEffect, useState } from "react";
// import {
//   Users,
//   UserPlus,
//   Layers,
//   Calendar,
//   FileText,
//   Mail,
// } from "lucide-react";

// export default function MyNetworkCard({ API_BASE, refreshTrigger }) {
//   const [connectionsCount, setConnectionsCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchConnectionsCount();
//   }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

//   async function fetchConnectionsCount() {
//     try {
//       const res = await fetch(`${API_BASE}/api/network/connections/count`, {
//         credentials: "include",
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setConnectionsCount(data.count);
//       }
//     } catch (err) {
//       console.error("Failed to fetch connections count:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="mynetwork-card">
//       <h3 className="mynetwork-left-title">Manage my network</h3>

//       <SidebarItem
//         icon={<Users size={20} />}
//         label="Connections"
//         count={loading ? "..." : connectionsCount}
//       />
//       <SidebarItem
//         icon={<UserPlus size={20} />}
//         label="Following & followers"
//       />
//       <SidebarItem icon={<Layers size={20} />} label="Groups" />
//       <SidebarItem icon={<Calendar size={20} />} label="Events" />
//       <SidebarItem icon={<FileText size={20} />} label="Pages" count="6" />
//       <SidebarItem icon={<Mail size={20} />} label="Newsletters" />
//     </div>
//   );
// }

// /* Reusable Sidebar Item */
// function SidebarItem({ icon, label, count }) {
//   return (
//     <div className="mynetwork-sidebar-item">
//       {icon}
//       <span>{label}</span>
//       {count && <span className="item-count">{count}</span>}
//     </div>
//   );
// }

// src/Components/Network/MyNetworkCard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Layers,
  Calendar,
  FileText,
  Mail,
} from "lucide-react";

export default function MyNetworkCard({ API_BASE, refreshTrigger }) {
  const navigate = useNavigate();
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectionsCount();
  }, [refreshTrigger]);

  async function fetchConnectionsCount() {
    try {
      const res = await fetch(`${API_BASE}/api/network/connections/count`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionsCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch connections count:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mynetwork-card">
      <h3 className="mynetwork-left-title">Manage my network</h3>

      <SidebarItem
        icon={<Users size={20} />}
        label="Connections"
        count={loading ? "..." : connectionsCount}
        onClick={() => navigate("/MyNetwork/connections")}
      />
      <SidebarItem
        icon={<UserPlus size={20} />}
        label="Following & followers"
        onClick={() => navigate("/MyNetwork/Following")}
      />
      <SidebarItem
        icon={<Layers size={20} />}
        label="Groups"
        onClick={() => navigate("/Groups")}
      />
      <SidebarItem
        icon={<Calendar size={20} />}
        label="Events"
        onClick={() => navigate("/Events")}
      />
      <SidebarItem
        icon={<FileText size={20} />}
        label="Pages"
        count="6"
        onClick={() => navigate("/MyNetwork/Pages")}
      />
      <SidebarItem
        icon={<Mail size={20} />}
        label="Newsletters"
        onClick={() => navigate("/MyNetwork/Newsletters")}
      />
    </div>
  );
}

/* Reusable Sidebar Item */
function SidebarItem({ icon, label, count, onClick }) {
  return (
    <div className="mynetwork-sidebar-item" onClick={onClick}>
      {icon}
      <span>{label}</span>
      {count && <span className="item-count">{count}</span>}
    </div>
  );
}
