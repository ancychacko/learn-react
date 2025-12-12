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

// export default function MyNetworkCard({ API_BASE }) {

//   const [connectionsCount, setConnectionsCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchConnectionsCount();
//   }, []);

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

//       <SidebarItem icon={<Users size={20} />} label="Connections" count="69" />
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
import {
  Users,
  UserPlus,
  Layers,
  Calendar,
  FileText,
  Mail,
} from "lucide-react";

export default function MyNetworkCard({ API_BASE }) {
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnectionsCount();
  }, []);

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
      />
      <SidebarItem
        icon={<UserPlus size={20} />}
        label="Following & followers"
      />
      <SidebarItem icon={<Layers size={20} />} label="Groups" />
      <SidebarItem icon={<Calendar size={20} />} label="Events" />
      <SidebarItem icon={<FileText size={20} />} label="Pages" count="6" />
      <SidebarItem icon={<Mail size={20} />} label="Newsletters" />
    </div>
  );
}

/* Reusable Sidebar Item */
function SidebarItem({ icon, label, count }) {
  return (
    <div className="mynetwork-sidebar-item">
      {icon}
      <span>{label}</span>
      {count && <span className="item-count">{count}</span>}
    </div>
  );
}
