// src/Layout/MainLayout.js
// import React from "react";
// import { useLocation } from "react-router-dom";
// import Header from "../Components/Header";

// export default function MainLayout({ children, API_BASE }) {
//   const location = useLocation();

//   // Pages that SHOULD NOT show the header
//   const hideHeaderPaths = ["/Login", "/Register", "/"];

//   const shouldHideHeader = hideHeaderPaths.includes(
//     location.pathname.split("?")[0]
//   );

//   return (
//     <div>
//       {/* Show header only when not on Login/Register */}
//       {!shouldHideHeader && <Header API_BASE={API_BASE} />}

//       {/* Actual page content */}
//       <div style={{ marginTop: shouldHideHeader ? 0 : "60px" }}>{children}</div>
//     </div>
//   );
// }
// src/Layout/MainLayout.js
import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "../Components/Header";

export default function MainLayout({ API_BASE }) {
  const location = useLocation();

  // Pages that SHOULD NOT show the header
  const hideHeaderPaths = ["/Login", "/Register", "/"];

  const shouldHideHeader = hideHeaderPaths.includes(
    location.pathname.split("?")[0]
  );

  return (
    <div>
      {/* Show header only when not on Login/Register */}
      {!shouldHideHeader && <Header API_BASE={API_BASE} />}

      {/* Page content MUST come from <Outlet /> */}
      <div style={{ marginTop: shouldHideHeader ? 0 : "60px" }}>
        <Outlet />
      </div>
    </div>
  );
}
