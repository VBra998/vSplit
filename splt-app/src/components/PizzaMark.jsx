import React from "react";

export default function PizzaMark({ size = 40 }) {
  return (
    <img
      src="/pizza-mark.png"
      alt="Splt Logo"
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}
