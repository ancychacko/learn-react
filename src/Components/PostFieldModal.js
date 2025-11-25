// src/Components/PostFieldModal.js
import React from "react";
import ReactDOM from "react-dom";
import { Image, Video, FileText, X, Globe2 } from "lucide-react";
import "./PostField.css";

export default function PostFieldModal({
  currentUser,
  avatarFull,
  visibility,
  setVisibility,
  content,
  setContent,
  onSubmit,
  loading,
  media,
  previewUrl,
  handlePhotoUpload,
  handleVideoUpload,
  setShowModal,
  setMedia,
  setPreviewUrl,
}) {
  // Remove preview (reset media)
  const closeButtonForPreview = () => {
    setMedia(null);
    setPreviewUrl(null);
  };
  const closeModal = () => {
    setShowModal(false);
    setContent("");
    setMedia(null);
    setPreviewUrl(null);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {/* ---------------- Header ---------------- */}
        <div className="modal-header">
          <h3>Create a post</h3>
          <button
            className="close-btn"
            style={{ width: "50px" }}
            onClick={closeModal}
          >
            <X size={22} color="black" />
          </button>
        </div>

        {/* ---------------- User Info + Visibility ---------------- */}
        <div className="modal-user">
          <img
            src={avatarFull(currentUser?.avatar_url)}
            alt="avatar"
            className="modal-avatar"
          />
          <div>
            <div className="modal-user-name">{currentUser?.name}</div>
            <div className="modal-user-sub">
              <Globe2 size={14} color="blue" style={{ marginRight: 4 }} />
              <select
                className="visibility-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="Anyone">Everyone</option>
                <option value="Connections">Connections only</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* ---------------- Post Form ---------------- */}
        <form onSubmit={onSubmit}>
          <textarea
            className="modal-textarea"
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* ---------------- Media Preview ---------------- */}
          {previewUrl && (
            <div className="preview-box">
              {media?.type?.startsWith("image/") ? (
                <>
                  <button
                    className="remove-media-btn"
                    type="button"
                    style={{ width: "50px" }}
                    onClick={closeButtonForPreview}
                  >
                    <X size={16} color="white" />
                  </button>
                  <img src={previewUrl} alt="preview" />
                </>
              ) : (
                <>
                  <button
                    className="remove-media-btn"
                    type="button"
                    style={{ width: "50px", marginBottom: "5px" }}
                    onClick={closeButtonForPreview}
                  >
                    <X size={16} color="white" />
                  </button>
                  <video controls src={previewUrl}></video>
                </>
              )}
            </div>
          )}

          {/* ---------------- Media Upload Buttons ---------------- */}
          <div className="modal-media">
            <label>
              <Image size={20} color="#0a66c2" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />
            </label>

            <label>
              <Video size={20} color="green" />
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: "none" }}
              />
            </label>

            <label>
              <FileText size={20} color="#b24020" />
            </label>
          </div>

          {/* ---------------- Footer (Submit) ---------------- */}
          <div className="modal-footer">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
