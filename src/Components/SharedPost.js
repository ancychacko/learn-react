// src/Components/SharedPost.js
// import React from "react";
// import "./Post.css";

// function mediaUrl(path) {
//   if (!path) return null;
//   return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
// }

// export default function SharedPost({ original }) {
//   if (!original) return null;

//   return (
//     <div className="shared-card">
//       {/* ORIGINAL OWNER HEADER */}
//       <div className="shared-header">
//         <img
//           src={
//             original.avatar_url
//               ? mediaUrl(original.avatar_url)
//               : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//           }
//           className="avatar-sm"
//           alt="avatar"
//         />

//         <div>
//           <div className="shared-author">{original.user_name}</div>
//           <div className="shared-date">
//             {new Date(original.created_at).toLocaleString()}
//           </div>
//         </div>
//       </div>

//       {/* ORIGINAL CONTENT */}
//       <div className="shared-body">
//         <p>{original.content}</p>

//         {original.media_url && original.media_type === "image" && (
//           <img
//             className="shared-media"
//             src={mediaUrl(original.media_url)}
//             alt=""
//           />
//         )}

//         {original.media_url && original.media_type === "video" && (
//           <video controls className="shared-media">
//             <source src={mediaUrl(original.media_url)} />
//           </video>
//         )}
//       </div>
//     </div>
//   );
// }

// src/Components/SharedPost.js
// import React from "react";
// import "./Post.css";

// function mediaUrl(path) {
//   if (!path) return null;
//   return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
// }

// export default function SharedPost({ original }) {
//   if (!original) return null;

//   return (
//     <div className="shared-card">
//       {/* =============================
//           ORIGINAL OWNER HEADER
//       ============================== */}
//       <div className="shared-header">
//         <img
//           src={
//             original.avatar_url
//               ? mediaUrl(original.avatar_url)
//               : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//           }
//           className="avatar-sm"
//           alt="avatar"
//         />

//         <div>
//           <div className="shared-author">{original.user_name}</div>
//           <div className="shared-date">
//             {new Date(original.created_at).toLocaleString()}
//           </div>
//         </div>
//       </div>

//       {/* =============================
//           ORIGINAL CONTENT
//       ============================== */}
//       <div className="shared-body">
//         <p>{original.content}</p>

//         {original.media_url && original.media_type === "image" && (
//           <img
//             className="shared-media"
//             src={mediaUrl(original.media_url)}
//             alt=""
//           />
//         )}

//         {original.media_url && original.media_type === "video" && (
//           <video controls className="shared-media">
//             <source src={mediaUrl(original.media_url)} />
//           </video>
//         )}
//       </div>
//     </div>
//   );
// }

// src/Components/SharedPost.js
import React from "react";
import "./Post.css";

const mediaUrl = (path) =>
  `${window.location.protocol}//${window.location.hostname}:4000${path}`;

export default function SharedPost({ original, missing }) {
  if (missing)
    return (
      <div className="shared-card missing">
        <p>This original post is no longer available.</p>
      </div>
    );

  if (!original) return null;

  return (
    <div className="shared-card">
      <div className="shared-header">
        <img
          src={
            original.avatar_url
              ? mediaUrl(original.avatar_url)
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          className="avatar-sm"
          alt="avatar"
        />

        <div>
          <div className="shared-author">{original.user_name}</div>
          <div className="shared-date">
            {new Date(original.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="shared-body">
        <p>{original.content}</p>

        {original.media_url && original.media_type === "image" && (
          <img className="shared-media" src={mediaUrl(original.media_url)} />
        )}

        {original.media_url && original.media_type === "video" && (
          <video controls className="shared-media">
            <source src={mediaUrl(original.media_url)} />
          </video>
        )}
      </div>
    </div>
  );
}
