/*
  A tiny, reusable input component.
  Important: it forwards the native event to onChange so parent can read e.target.name and e.target.value.
  Props:
    - id (string)
    - name (string)  <-- must be set so parent change(e) can use e.target.name
    - label (string) optional (not visible in this minimal example)
    - type (text|email|password|...)
    - value (string)
    - onChange (function) receives native event
    - placeholder (string)
*/

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
