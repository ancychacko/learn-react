// // src/MainLayout.js
// import React from "react";
// import Header from "../Components/Header";

// export default function MainLayout({ children, API_BASE, user }) {
//   return (
//     <div>
//       <Header API_BASE={API_BASE} user={user} />
//       <div style={{ paddingTop: 70 }}>{children}</div>
//     </div>
//   );
// }

// src/Layout/MainLayout.js
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../Components/Header";

export default function MainLayout({ children, API_BASE }) {
  const location = useLocation();

  // Pages that SHOULD NOT show the header
  const hideHeaderPaths = ["/Login", "/Register", "/", "/Home"];

  const shouldHideHeader = hideHeaderPaths.includes(
    location.pathname.split("?")[0]
  );

  return (
    <div>
      {/* Show header only when not on Login/Register */}
      {!shouldHideHeader && <Header API_BASE={API_BASE} />}

      {/* Actual page content */}
      <div style={{ marginTop: shouldHideHeader ? 0 : "75px" }}>{children}</div>
    </div>
  );
}
