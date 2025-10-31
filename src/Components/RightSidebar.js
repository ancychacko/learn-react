// // RightSidebar.js
// import React, { useEffect, useState } from "react";

// export default function RightSidebar({ API_BASE }) {
//   const [items, setItems] = useState([]);
//   useEffect(() => {
//     (async () => {
//       try {
//         const r = await fetch(`${API_BASE}/api/suggestions`);
//         if (r.ok) setItems(await r.json());
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, [API_BASE]);

//   return (
//     <div className="right-card">
//       <h4>People you may know</h4>
//       {items.map((it) => (
//         <div key={it.id} className="suggestion">
//           <div>
//             <div style={{ fontWeight: 600 }}>{it.name}</div>
//             <div style={{ fontSize: 12, color: "#666" }}>{it.title}</div>
//           </div>
//           <button
//             style={{
//               background: "#0a66c2",
//               color: "#fff",
//               border: "none",
//               padding: "6px 10px",
//               borderRadius: 6,
//             }}
//           >
//             Connect
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// src/Components/RightSidebar.js
import React, { useEffect, useState } from "react";

export default function RightSidebar({ API_BASE }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/suggestions`);
        if (r.ok) setItems(await r.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [API_BASE]);

  return (
    <aside className="right-card">
      <h4>People you may know</h4>
      {items.map((it) => (
        <div key={it.id} className="suggest">
          <div>
            <div style={{ fontWeight: 700 }}>{it.name}</div>
            <div className="muted">{it.title}</div>
          </div>
          <button className="btn">Connect</button>
        </div>
      ))}
    </aside>
  );
}
