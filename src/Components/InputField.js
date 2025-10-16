// import React from 'react';

// export default function InputField({ id, label, type='text', value, onChange, placeholder, error }) {
//   return (
//     <div className="input-field">
//       <label htmlFor={id}>{label}</label>
//       <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} />
//       {error && <div className="error">{error}</div>}
//     </div>
//   );
// }

import React from "react";
export default function InputField({
  id,
  name,
  label = "",
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={id} style={{ display: "none" }}>
        {label || name}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #e6edf3",
          fontSize: 14,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
