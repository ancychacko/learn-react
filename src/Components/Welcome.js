// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Welcome() {
//   const navigate = useNavigate();
//   const [name, setName] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef();

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await fetch("http://localhost:4000/api/me", {
//           credentials: "include",
//         });
//         if (res.status === 401) {
//           // not logged in -> go to login (replace so back doesn't go to welcome)
//           navigate("/Login", { replace: true });
//           return;
//         }
//         const body = await res.json();
//         if (mounted) setName(body.name);
//       } catch (e) {
//         console.error("me fetch failed", e);
//         navigate("/Login", { replace: true });
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => (mounted = false);
//   }, [navigate]);

//   useEffect(() => {
//     function onDoc(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target))
//         setMenuOpen(false);
//     }
//     document.addEventListener("click", onDoc);
//     return () => document.removeEventListener("click", onDoc);
//   }, []);

//   if (loading) return null;

//   async function logout() {
//     try {
//       await fetch("http://localhost:4000/api/logout", {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch (e) {
//       console.error("logout failed", e);
//     }
//     navigate("/Login", { replace: true });
//   }

//   return (
//     <div className="register-container">
//       <div className="welcome-box" style={{ width: 480 }}>
//         <div className="welcome-header">
//           <div className="welcome-text">Welcome {name}!</div>

//           <div style={{ position: "relative" }} ref={menuRef}>
//             <button
//               className="profile-btn"
//               onClick={() => setMenuOpen((s) => !s)}
//               aria-haspopup="true"
//               aria-expanded={menuOpen}
//             >

//               <span style={{ color: "#1e3a8a", fontWeight: 700 }}>
//                 {name ? name.charAt(0).toUpperCase() : "?"}
//               </span>
//             </button>

//             {menuOpen && (
//               <div className="profile-menu" role="menu">
//                 <button
//                   onClick={() => {
//                     setMenuOpen(false);
//                     /* placeholder */ alert("Profile update not implemented");
//                   }}
//                 >
//                   Update profile
//                 </button>
//                 <button
//                   onClick={() => {
//                     setMenuOpen(false);
//                     /* placeholder */ alert("Settings not implemented");
//                   }}
//                 >
//                   Settings
//                 </button>
//                 <button onClick={logout}>Sign out</button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div style={{ color: "#333", paddingTop: 6, fontSize: 14 }}>
//           You have successfully logged in.
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function Welcome(){
//   const navigate = useNavigate();
//   const [name, setName] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef();

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await fetch('http://localhost:4000/api/me', { credentials: 'include' });
//         if (res.status === 401) {
//           navigate('/Login', { replace: true });
//           return;
//         }
//         const body = await res.json();
//         if (mounted) setName(body.name);
//       } catch (err) {
//         console.error('me fetch failed', err);
//         navigate('/Login', { replace: true });
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => mounted = false;
//   }, [navigate]);

//   useEffect(() => {
//     function onDoc(e){
//       if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
//     }
//     document.addEventListener('click', onDoc);
//     return () => document.removeEventListener('click', onDoc);
//   }, []);

//   if (loading) return null;

//   async function logout(){
//     try {
//       await fetch('http://localhost:4000/api/logout', { method:'POST', credentials:'include' });
//     } catch (e) { console.error(e); }
//     navigate('/Login', { replace: true });
//   }

//   return (
//     <div style={{ padding: 28 }}>
//       <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth: 900, margin:'0 auto' }}>
//         <div>
//           <h1 style={{ margin:0 }}>Welcome {name}!</h1>
//         </div>

//         <div style={{ position:'relative' }} ref={menuRef}>
//           <button
//             onClick={() => setMenuOpen(s => !s)}
//             style={{
//               width:44, height:44, borderRadius:999, border:'none', background:'#eef2ff',
//               display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'
//             }}
//             aria-haspopup="true"
//             aria-expanded={menuOpen}
//           >
//             <span style={{ color:'#1e3a8a', fontWeight:700 }}>{ name ? name.charAt(0).toUpperCase() : '?' }</span>
//           </button>

//           { menuOpen && (
//             <div style={{
//               position:'absolute', right:0, marginTop:8, background:'#fff', boxShadow:'0 6px 18px rgba(0,0,0,0.08)',
//               borderRadius:8, minWidth:180, zIndex:200
//             }}>
//               <button style={menuBtnStyle} onClick={()=>{ setMenuOpen(false); navigate('/profile'); }}>Update profile</button>
//               <button style={menuBtnStyle} onClick={()=>{ setMenuOpen(false); navigate('/settings'); }}>Settings</button>
//               <div style={{ height:1, background:'#eee', margin:'6px 0' }} />
//               <button style={menuBtnStyle} onClick={logout}>Sign out</button>
//             </div>
//           )}
//         </div>
//       </div>

//       <p style={{ maxWidth: 900, margin:'20px auto 0' }}>
//         You have successfully logged in.
//       </p>
//     </div>
//   );
// }

// const menuBtnStyle = {
//   display:'block',
//   width:'100%',
//   padding:'10px 12px',
//   border:'none',
//   background:'transparent',
//   textAlign:'left',
//   cursor:'pointer'
// };

// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Welcome.css';

// export default function Welcome() {
//   const navigate = useNavigate();
//   const [name, setName] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await fetch('http://localhost:4000/api/me', { credentials: 'include' });
//         if (res.status === 401) {
//           // not authenticated -> go to login (lowercase route)
//           navigate('/Login', { replace: true });
//           return;
//         }
//         const body = await res.json();
//         if (mounted) setName(body.name);
//       } catch (err) {
//         console.error('me fetch failed', err);
//         navigate('/Login', { replace: true });
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [navigate]);

//   // close menu on outside click
//   useEffect(() => {
//     function onDoc(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener('click', onDoc);
//     return () => document.removeEventListener('click', onDoc);
//   }, []);

//   if (loading) return null;

//   async function logout() {
//     try {
//       await fetch('http://localhost:4000/api/logout', { method: 'POST', credentials: 'include' });
//     } catch (e) {
//       console.error('Logout failed', e);
//     }
//     // always go to login and replace history so back button won't return here
//     navigate('/Login', { replace: true });
//   }

//   return (
//     <div className="welcome-page">
//       <div className="welcome-inner">
//         <div className="welcome-left">
//           <h1 className="welcome-title">Welcome {name}!</h1>
//           <p className="welcome-sub">You have successfully logged in.</p>
//         </div>

//         <div className="welcome-right" ref={menuRef}>
//           <button
//             className="profile-btn"
//             onClick={() => setMenuOpen(s => !s)}
//             aria-haspopup="true"
//             aria-expanded={menuOpen}
//             aria-label="Open profile menu"
//           >
//             {name ? name.charAt(0).toUpperCase() : '?'}
//           </button>

//           {menuOpen && (
//             <div className="profile-menu" role="menu" aria-label="Profile menu">
//               <button className="profile-menu-item" onClick={() => { setMenuOpen(false); navigate('/Profile'); }}>
//                 Update profile
//               </button>
//               {/* <button className="profile-menu-item" onClick={() => { setMenuOpen(false); navigate('/Settings'); }}>
//                 Settings
//               </button> */}

//               <div className="profile-menu-divider" />

//               <button className="profile-menu-item danger" onClick={logout}>
//                 Sign out
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/me", {
          credentials: "include",
        });
        if (res.status === 401) {
          navigate("/Login", { replace: true });
          return;
        }
        const body = await res.json();
        if (mounted) setName(body.name);
      } catch (err) {
        console.error("me fetch failed", err);
        navigate("/Login", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (loading) return null;

  async function logout() {
    try {
      await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("logout failed", e);
    }
    navigate("/Login", { replace: true });
  }

  return (
    <div className="welcome-page">
      <div className="welcome-inner">
        <div className="welcome-left">
          <h1 className="welcome-title">Welcome {name}!</h1>
          <p className="welcome-sub">You have successfully logged in.</p>
        </div>

        <div className="welcome-right" ref={menuRef}>
          <button
            className="profile-btn"
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Open profile menu"
          >
            {name ? name.charAt(0).toUpperCase() : "?"}
          </button>

          {menuOpen && (
            <div className="profile-menu" role="menu" aria-label="Profile menu">
              <button
                className="profile-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/Profile");
                }}
              >
                Update profile
              </button>

              <div className="profile-menu-divider" />

              <button className="profile-menu-item danger" onClick={logout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="welcome-note">Try it</p>
    </div>
  );
}
