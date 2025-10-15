import React from 'react';

export default function InputField({ id, label, type='text', value, onChange, placeholder, error }) {
  return (
    <div className="input-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      {error && <div className="error">{error}</div>}
    </div>
  );
}
