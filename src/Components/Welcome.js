// // src/Components/Welcome.js
// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Welcome.css";

// export default function Welcome() {
//   const navigate = useNavigate();
//   const [name, setName] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);

//   // ✅ Check session and fetch user details
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await fetch("http://192.168.2.77:4000/api/me", {
//           method: "GET",
//           credentials: "include", // Important for session cookies
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "no-cache",
//           },
//         });

//         if (res.ok) {
//           const user = await res.json();
//           if (mounted) {
//             setName(user.name);
//           }
//         } else if (res.status === 401) {
//           // Session expired or user not logged in
//           navigate("/Login", { replace: true });
//           return;
//         } else {
//           console.error("Unexpected response:", res.status);
//         }
//       } catch (err) {
//         console.error("Failed to fetch /api/me:", err);
//         navigate("/Login", { replace: true });
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [navigate]);

//   // ✅ Close dropdown when clicked outside
//   useEffect(() => {
//     function onClickOutside(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("click", onClickOutside);
//     return () => document.removeEventListener("click", onClickOutside);
//   }, []);

//   if (loading) return null;

//   // ✅ Logout handler
//   async function handleLogout() {
//     try {
//       const res = await fetch("http://192.168.2.77:4000/api/logout", {
//         method: "POST",
//         credentials: "include", // Needed to clear correct session
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.ok) {
//         navigate("/Login", { replace: true });
//       } else {
//         console.warn("Logout failed:", res.status);
//         navigate("/Login", { replace: true });
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//       navigate("/Login", { replace: true });
//     }
//   }

//   return (
//     <div className="welcome-page">
//       <div className="welcome-inner">
//         {/* Left side: Welcome message */}
//         <div className="welcome-left">
//           <h1 className="welcome-title">Welcome {name}!</h1>
//           <p className="welcome-sub">You have successfully logged in.</p>
//         </div>

//         {/* Right side: Profile icon + dropdown */}
//         <div className="welcome-right" ref={menuRef}>
//           <button
//             className="profile-btn"
//             onClick={() => setMenuOpen((s) => !s)}
//             aria-haspopup="true"
//             aria-expanded={menuOpen}
//             aria-label="Open profile menu"
//           >
//             {name ? name.charAt(0).toUpperCase() : "?"}
//           </button>

//           {menuOpen && (
//             <div
//               className="profile-menu"
//               role="menu"
//               aria-label="Profile menu"
//               style={{ top: "100%", marginTop: "10px" }} // ✅ ensures dropdown is below icon
//             >
//               <button
//                 className="profile-menu-item"
//                 onClick={() => {
//                   setMenuOpen(false);
//                   navigate("/Profile");
//                 }}
//               >
//                 Update profile
//               </button>

//               <div className="profile-menu-divider" />

//               <button
//                 className="profile-menu-item danger"
//                 onClick={handleLogout}
//               >
//                 Sign out
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <p className="welcome-note">Try it</p>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "./ProfileCard";
import PostFeed from "./PostFeed";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = "http://192.168.2.77:4000";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });
        if (res.status === 401) {
          navigate("/Login", { replace: true });
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Fetch /me failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="home-page">
      <div className="home-sidebar">
        <ProfileCard user={user} />
      </div>
      <div className="home-feed">
        <PostFeed API_BASE={API_BASE} />
      </div>
    </div>
  );
}
