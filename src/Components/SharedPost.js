// src/Components/SharedPost.js
// import React from "react";
// import "./Post.css";

// function mediaUrl(path) {
//   if (!path) return null;
//   const host = window.location.hostname;
//   const protocol = window.location.protocol;
//   return `${protocol}//${host}:4000${path}`;
// }

// /* ----------------------------------------------
//    INNER ORIGINAL POST (NO ACTIONS)
// ---------------------------------------------- */
// function PostInner({ post }) {
//   if (!post) return null;

//   return (
//     <div className="post-inner-card">
//       <div className="post-inner-header">
//         <img
//           src={
//             post.avatar_url
//               ? mediaUrl(post.avatar_url)
//               : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//           }
//           className="avatar-sm"
//           alt="avatar"
//         />
//         <div>
//           <div className="post-author">{post.user_name}</div>
//           <div className="post-meta">
//             {new Date(post.created_at).toLocaleString()}
//           </div>
//         </div>
//       </div>

//       <div className="post-inner-body">
//         <p>{post.content}</p>

//         {post.media_url && post.media_type === "image" && (
//           <img className="post-media" src={mediaUrl(post.media_url)} alt="" />
//         )}

//         {post.media_url && post.media_type === "video" && (
//           <video controls className="post-media">
//             <source src={mediaUrl(post.media_url)} />
//           </video>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ----------------------------------------------
//    MAIN SHARED POST WRAPPER
// ---------------------------------------------- */
// export default function SharedPost({ post }) {
//   if (!post) return null;

//   // CASE 1: backend provides post.shared object
//   if (post.shared?.original_post) {
//     return (
//       <div className="post-shared-container">
//         <div className="post-shared-header">
//           <img
//             src={
//               post.shared.sharer_avatar
//                 ? mediaUrl(post.shared.sharer_avatar)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             className="avatar-sm"
//             alt="sharer"
//           />
//           <div>
//             <div className="post-author">{post.shared.sharer_name}</div>
//           </div>
//         </div>

//         <div className="post-shared-inner">
//           <PostInner post={post.shared.original_post} />
//         </div>
//       </div>
//     );
//   }

//   // CASE 2: backend stores original inside data.original_post
//   if (post.data) {
//     try {
//       const parsed =
//         typeof post.data === "string" ? JSON.parse(post.data) : post.data;

//       if (parsed?.original_post) {
//         return (
//           <div className="post-shared-container">
//             <div className="post-shared-header">
//               <img
//                 src={
//                   parsed.sharer_avatar
//                     ? mediaUrl(parsed.sharer_avatar)
//                     : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                 }
//                 className="avatar-sm"
//                 alt="sharer"
//               />
//               <div className="post-author">{parsed.sharer_name}</div>
//             </div>

//             <div className="post-shared-inner">
//               <PostInner post={parsed.original_post} />
//             </div>
//           </div>
//         );
//       }
//     } catch {}
//   }

//   // CASE 3: post.original_post object
//   if (post.original_post) {
//     return (
//       <div className="post-shared-container">
//         <div className="post-shared-header">
//           <img
//             src={
//               post.avatar_url
//                 ? mediaUrl(post.avatar_url)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             className="avatar-sm"
//             alt="sharer"
//           />
//           <div className="post-author">{post.user_name}</div>
//         </div>

//         <div className="post-shared-inner">
//           <PostInner post={post.original_post} />
//         </div>
//       </div>
//     );
//   }

//   // CASE 4: fallback when content starts with "Shared:"
//   if (String(post.content || "").startsWith("Shared:")) {
//     return (
//       <div className="post-shared-container">
//         <div className="post-shared-header">
//           <img
//             src={
//               post.avatar_url
//                 ? mediaUrl(post.avatar_url)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             className="avatar-sm"
//             alt="avatar"
//           />
//           <div className="post-author">{post.user_name}</div>
//         </div>

//         <div className="post-shared-inner">
//           <PostInner
//             post={{
//               content: post.content.replace(/^Shared:\s*/i, ""),
//               media_url: post.media_url,
//               media_type: post.media_type,
//               user_name: "Original Post",
//             }}
//           />
//         </div>
//       </div>
//     );
//   }

//   return null;
// }

// src/Components/SharedPost.js
import React from "react";
import "./Post.css";

function mediaUrl(path) {
  if (!path) return null;
  return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
}

/**
 * ORIGINAL POST INSIDE CARD (LinkedIn style)
 */
function OriginalPost({ original }) {
  return (
    <div className="post-inner-card">
      {/* Original Author */}
      <div className="post-inner-header">
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
          <div className="post-author">{original.user_name}</div>
          <div className="post-meta">
            {new Date(original.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Original Content */}
      <div className="post-inner-body">
        <p>{original.content}</p>

        {original.media_url && original.media_type === "image" && (
          <img
            className="post-media"
            src={mediaUrl(original.media_url)}
            alt=""
          />
        )}

        {original.media_url && original.media_type === "video" && (
          <video controls className="post-media">
            <source src={mediaUrl(original.media_url)} />
          </video>
        )}
      </div>
    </div>
  );
}

/**
 * MAIN SHARED POST
 */

export default function SharedPost({ post }) {
  // If this is not a shared post → render nothing
  if (!post.shared_post) return null;

  const original = post.shared_post;

  return (
    <div className="post-shared-container">
      {/* Sharer Header */}
      <div className="post-shared-header">
        <img
          src={
            post.avatar_url
              ? mediaUrl(post.avatar_url)
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          className="avatar-sm"
          alt="sharer"
        />
        <div>
          <div className="post-author">{post.user_name}</div>
          <div className="post-meta">shared this</div>
        </div>
      </div>

      {/* Original Post */}
      <div className="post-shared-inner">
        <OriginalPost original={original} />
      </div>
    </div>
  );
}
