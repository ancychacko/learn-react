// // Welcome.js
// import React, { useEffect, useState } from "react";
// import ProfileCard from "./ProfileCard";
// import PostFeed from "./PostFeed";
// import RightSidebar from "./RightSidebar";
// import "./Welcome.css";

// export default function Welcome() {
//   const API_BASE =
//     process.env.REACT_APP_API_BASE ||
//     `${window.location.protocol}//${window.location.hostname}:4000`;
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/me`, {
//           credentials: "include",
//         });
//         if (res.status === 401) {
//           window.location.href = "/login";
//           return;
//         }
//         const b = await res.json();
//         setUser(b);
//       } catch (e) {
//         console.error(e);
//         window.location.href = "/login";
//       }
//       setLoading(false);
//     })();
//   }, [API_BASE]);

//   if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
//   if (!user) return null;

//   return (
//     <div className="home-container">
//       <div className="left-col">
//         <ProfileCard user={user} API_BASE={API_BASE} />
//       </div>

//       <div className="center-col">
//         <PostFeed API_BASE={API_BASE} currentUserId={user.id} />
//       </div>

//       <div className="right-col">
//         <RightSidebar API_BASE={API_BASE} />
//       </div>
//     </div>
//   );
// }

// src/Components/Welcome.js
import React, { useEffect, useState } from "react";
import Header from "./Header";
import ProfileCard from "./ProfileCard";
import PostField from "./PostField";
import RightSidebar from "./RightSidebar";
import "./Welcome.css";

export default function Welcome() {
  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    `${window.location.protocol}//${window.location.hostname}:4000`;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
        if (r.status === 401) {
          window.location.href = "/login";
          return;
        }
        const body = await r.json();
        setUser(body);
      } catch (e) {
        console.error(e);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Header API_BASE={API_BASE} />
      <div className="home-grid">
        <aside className="left-col">
          <ProfileCard user={user} API_BASE={API_BASE} />
        </aside>

        <main className="center-col">
          <PostField API_BASE={API_BASE} currentUserId={user.id} />
        </main>

        <aside className="right-col">
          <RightSidebar API_BASE={API_BASE} />
        </aside>
      </div>
    </>
  );
}
