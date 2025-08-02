import React, { useState } from "react";
import "../product.css"
export default function Product() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="containerA">
    <div className="product-page container">
      <h1>Discover NEW Arrivals</h1>
      <p className="subtitle">Recently added shirts and jackets!</p>

      <div className="product-grid">
        {products.map((product, index) => (
          <div
            key={index}
            className="product-card"
            onClick={() => setSelected(product)}
          >
            <img src={product.img} alt={product.title} />
            <h3>{product.title}</h3>
            <p className="price">{product.price}</p>
          </div>
        ))}
      </div>

    {selected && (
  <div
    className="overlay"
    onClick={() => setSelected(null)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "600px",
        width: "90%",
        boxShadow: "0 0 15px rgba(0,0,0,0.5)",
        zIndex: 10000,
      }}
    >
      <img
        src={selected.image}
        alt={selected.title}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <h2>{selected.title}</h2>
      <p>{selected.description}</p>
      <p><strong>Price:</strong> {selected.price}</p>
      <button onClick={() => setSelected(null)}>Close</button>
    </div>
  </div>
)}

    </div>
    </div>
  );
}
