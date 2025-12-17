// src/Components/Network/CatchUpCard.js
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// export default function CatchUpCard({ API_BASE }) {
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState("all");
//   const [updates, setUpdates] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchUpdates();
//   }, [filter]);

//   async function fetchUpdates() {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${API_BASE}/api/network/catchup?filter=${filter}`,
//         {
//           credentials: "include",
//         }
//       );
//       if (res.ok) {
//         const data = await res.json();
//         setUpdates(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch updates:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleGrowNetwork() {
//     // Scroll to top
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   const filters = [
//     { id: "all", label: "All" },
//     { id: "job_changes", label: "Job changes" },
//     { id: "birthdays", label: "Birthdays" },
//     { id: "work_anniversaries", label: "Work anniversaries" },
//     { id: "education", label: "Education" },
//   ];

//   return (
//     <>
//       {/* Vertical Filter Card */}
//       <div className="catchup-filter-card">
//         {filters.map((f) => (
//           <button
//             key={f.id}
//             className={`catchup-filter-item ${filter === f.id ? "active" : ""}`}
//             onClick={() => setFilter(f.id)}
//           >
//             {f.label}
//           </button>
//         ))}
//       </div>

//       {/* Content Area */}
//       <div className="catchup-content-card">
//         {loading ? (
//           <div className="catchup-loading">Loading updates...</div>
//         ) : updates.length === 0 ? (
//           <EmptyState onGrowNetwork={handleGrowNetwork} />
//         ) : (
//           <div className="catchup-updates">
//             {updates.map((update) => (
//               <UpdateCard key={update.id} update={update} />
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // Empty State Component
// function EmptyState({ onGrowNetwork }) {
//   return (
//     <div className="catchup-empty">
//       <div className="empty-icon">
//         <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
//           <rect width="96" height="96" rx="12" fill="#E8F3F8" />
//           <rect x="24" y="32" width="48" height="4" rx="2" fill="#B0C4D0" />
//           <rect x="24" y="44" width="32" height="4" rx="2" fill="#B0C4D0" />
//           <circle cx="68" cy="56" r="8" fill="#FDB022" />
//           <path
//             d="M68 52V56M68 56V60M68 56H64M68 56H72"
//             stroke="white"
//             strokeWidth="2"
//             strokeLinecap="round"
//           />
//         </svg>
//       </div>
//       <h3 className="empty-title">No recent updates</h3>
//       <p className="empty-description">
//         As your network grows, you'll get more updates.
//       </p>
//       <button className="grow-network-btn-blue" onClick={onGrowNetwork}>
//         Grow your network
//       </button>
//     </div>
//   );
// }

// // Update Card Component
// function UpdateCard({ update }) {
//   const avatar =
//     update.avatar_url ||
//     "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   function getUpdateText() {
//     switch (update.type) {
//       case "job_change":
//         return `started a new position as ${update.new_title} at ${update.company}`;
//       case "birthday":
//         return "has a birthday today!";
//       case "work_anniversary":
//         return `celebrates ${update.years} year${
//           update.years > 1 ? "s" : ""
//         } at ${update.company}`;
//       case "education":
//         return `completed a course: ${update.course_name}`;
//       default:
//         return "has an update";
//     }
//   }

//   function getIcon() {
//     switch (update.type) {
//       case "birthday":
//         return "🎂";
//       case "work_anniversary":
//         return "🎉";
//       case "job_change":
//         return "💼";
//       case "education":
//         return "🎓";
//       default:
//         return "📢";
//     }
//   }

//   return (
//     <div className="update-card">
//       <div className="update-avatar-wrapper">
//         <img src={avatar} alt={update.name} className="update-avatar" />
//         <span className="update-icon">{getIcon()}</span>
//       </div>
//       <div className="update-content">
//         <p className="update-text">
//           <strong>{update.name}</strong> {getUpdateText()}
//         </p>
//         <p className="update-time">
//           {new Date(update.created_at).toLocaleDateString()}
//         </p>
//       </div>
//       <button className="say-congrats-btn">Say congrats</button>
//     </div>
//   );
// }

// src/Components/Network/CatchUpCard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CatchUpCard({ API_BASE }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, [filter]);

  async function fetchUpdates() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/network/catchup?filter=${filter}`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setUpdates(data);
      }
    } catch (err) {
      console.error("Failed to fetch updates:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleGrowNetwork() {
    // Navigate to grow page
    navigate("/MyNetwork");
  }

  const filters = [
    { id: "all", label: "All" },
    { id: "job_changes", label: "Job changes" },
    { id: "birthdays", label: "Birthdays" },
    { id: "work_anniversaries", label: "Work anniversaries" },
    { id: "education", label: "Education" },
  ];

  return (
    <>
      {/* Vertical Filter Card */}
      <div className="catchup-filter-card">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`catchup-filter-item ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="catchup-content-card">
        {loading ? (
          <div className="catchup-loading">Loading updates...</div>
        ) : updates.length === 0 ? (
          <EmptyState onGrowNetwork={handleGrowNetwork} />
        ) : (
          <div className="catchup-updates">
            {updates.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// Empty State Component
function EmptyState({ onGrowNetwork }) {
  return (
    <div className="catchup-empty">
      <div className="empty-icon">
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
          <rect width="96" height="96" rx="12" fill="#E8F3F8" />
          <rect x="24" y="32" width="48" height="4" rx="2" fill="#B0C4D0" />
          <rect x="24" y="44" width="32" height="4" rx="2" fill="#B0C4D0" />
          <circle cx="68" cy="56" r="8" fill="#FDB022" />
          <path
            d="M68 52V56M68 56V60M68 56H64M68 56H72"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="empty-title">No recent updates</h3>
      <p className="empty-description">
        As your network grows, you'll get more updates.
      </p>
      <button className="grow-network-btn-blue" onClick={onGrowNetwork}>
        Grow your network
      </button>
    </div>
  );
}

// Update Card Component
function UpdateCard({ update }) {
  const avatar =
    update.avatar_url ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  function getUpdateText() {
    switch (update.type) {
      case "job_change":
        return `started a new position as ${update.new_title} at ${update.company}`;
      case "birthday":
        return "has a birthday today!";
      case "work_anniversary":
        return `celebrates ${update.years} year${
          update.years > 1 ? "s" : ""
        } at ${update.company}`;
      case "education":
        return `completed a course: ${update.course_name}`;
      default:
        return "has an update";
    }
  }

  function getIcon() {
    switch (update.type) {
      case "birthday":
        return "🎂";
      case "work_anniversary":
        return "🎉";
      case "job_change":
        return "💼";
      case "education":
        return "🎓";
      default:
        return "📢";
    }
  }

  return (
    <div className="update-card">
      <div className="update-avatar-wrapper">
        <img src={avatar} alt={update.name} className="update-avatar" />
        <span className="update-icon">{getIcon()}</span>
      </div>
      <div className="update-content">
        <p className="update-text">
          <strong>{update.name}</strong> {getUpdateText()}
        </p>
        <p className="update-time">
          {new Date(update.created_at).toLocaleDateString()}
        </p>
      </div>
      <button className="say-congrats-btn">Say congrats</button>
    </div>
  );
}
