import React from "react";
import "./Documentation.css";

const WearUpDocs = () => {
  return (
    <div className="wearup-container">
      <h1>WearUp: The Story of Building a Sustainable Fashion Marketplace</h1>

      <section>
        <h2>The Spark of an Idea</h2>
        <p>
          It all started with a simple observation: our closets are full of clothes we don't wear, while the fashion industry keeps producing more, hurting our planet.
          I thought, <em>"What if technology could help solve this?"</em> That's how <strong>WearUp</strong> was born — a platform where people could easily buy and sell
          second-hand clothes, making fashion more sustainable and affordable.
        </p>
        <p>
          I wanted to build something that felt modern and easy to use, not like a typical thrift store. I envisioned a place where you could find great styles, connect
          with others, and feel good about reducing waste.
        </p>
      </section>

      <section>
        <h2>Building with the Right Tools</h2>
        <p>
          When I started building WearUp, I chose technologies that would work well together and grow with the project. Think of it like building a house: you need a strong
          foundation and a beautiful interior.
        </p>

        <h3>The Frontend (What You See)</h3>
        <p>
          I used <strong>React</strong> to create the website you interact with. It's like the storefront and shelves — everything you click, see, and navigate.
          React made it easy to build a fast, responsive site that works perfectly on phones and computers.
        </p>

        <h3>The Backend (The Brain)</h3>
        <p>
          For the behind-the-scenes work, I used <strong>Django</strong>. This handles all the data — user accounts, products, orders — and makes sure everything is secure
          and organized. It's the engine that powers everything.
        </p>
      </section>

      <section>
        <h2>A Tour Through WearUp</h2>

        <h3>Welcome to the Store</h3>
        <p>
          When you first visit WearUp, you're greeted by a beautiful homepage (<code>landing.jsx</code>) that shows off the best items and explains our mission.
          It's designed to make you feel welcome and excited to explore.
        </p>

        <h3>Finding Your Style</h3>
        <p>
          As you browse, you can filter clothes by category, size, or price (<code>categories.jsx</code>). Whether you're looking for women's dresses or men's jackets,
          the system helps you find exactly what you want without frustration.
        </p>

        <h3>Getting to Know the Story Behind Each Item</h3>
        <p>
          When you click on a product (<code>product.jsx</code>), you don't just see pictures and prices. You learn about the seller, see the item's condition, and can even
          ask questions. This builds trust — you're not just buying from a stranger; you're connecting with someone who shares your interest in sustainable fashion.
        </p>

        <h3>Becoming Part of the Community</h3>
        <p>
          Creating an account (<code>login.jsx</code>, <code>signup.jsx</code>) unlocks more features. You can save favorite items, track your orders, and if you decide to sell,
          you get your own dashboard (<code>dashboard.jsx</code>) to manage your listings.
        </p>

        <h3>Selling Made Simple</h3>
        <p>
          If you have clothes to sell, the process is straightforward. The "Add Product" form (<code>Add-product.jsx</code>) guides you through uploading photos,
          writing descriptions, and setting prices. It's designed to be simple even if you're not tech-savvy.
        </p>

        <h3>Shopping Without Stress</h3>
        <p>
          Your shopping cart (<code>cart.jsx</code>) remembers what you've selected, even if you leave and come back later. The checkout process is clean and simple,
          making it easy to complete your purchase.
        </p>
      </section>

      <section>
        <h2>Behind the Curtain: How Everything Works Together</h2>

        <h3>Organizing All the Information</h3>
        <p>
          In the backend, I created a smart system (<code>models.py</code>) to organize all the data. It understands that each user can be both a buyer and seller, every
          product has a story, orders need tracking, and likes/comments build community.
        </p>

        <h3>Making Sure Everything Runs Smoothly</h3>
        <p>
          The backend code (<code>views.py</code>) handles important tasks like showing products, securing accounts, processing orders, and managing likes/comments.
        </p>

        <h3>Keeping Data Safe and Clean</h3>
        <p>
          Before saving any data, it’s validated through (<code>serializers.py</code>) to ensure everything is accurate — from prices to image formats — maintaining
          a high-quality marketplace.
        </p>
      </section>

      <section>
        <h2>The Technical Magic That Makes It Shine</h2>

        <h3>Smart State Management</h3>
        <p>
          The website feels responsive because it only updates what needs to change. When you like an item, only that button updates — not the whole page.
        </p>

        <h3>Security That Doesn't Get in the Way</h3>
        <p>
          Modern JWT-based authentication keeps user accounts secure while allowing smooth transitions between devices.
        </p>

        <h3>Built to Grow</h3>
        <p>
          The architecture separates frontend and backend, allowing independent updates as the project scales.
        </p>
      </section>

      <section>
        <h2>The Complete User Journey</h2>
        <p>
          <strong>Discovery:</strong> You arrive at a beautiful homepage, browse categories, and find second-hand gems.
          <br />
          <strong>Connection:</strong> You explore items, learn about sellers, and save your favorites.
          <br />
          <strong>Action:</strong> You buy or sell items easily.
          <br />
          <strong>Community:</strong> You return to like, comment, and contribute to sustainable fashion.
        </p>
      </section>

      <section>
        <h2>Why These Choices Matter</h2>
        <p>
          Every design decision focused on real users:
          <ul>
            <li>Responsive design for all devices</li>
            <li>Social features that build trust</li>
            <li>Simple listing process to encourage sellers</li>
            <li>Secure system to protect users and transactions</li>
          </ul>
        </p>
      </section>

      <section>
        <h2>What's Next for WearUp</h2>
        <ul>
          <li>Payment gateway integration (Stripe or eSewa)</li>
          <li>Smart AI-based recommendations</li>
          <li>Image-based search functionality</li>
          <li>Seller analytics and insights</li>
        </ul>
      </section>

      <section>
        <h2>The Bigger Picture</h2>
        <p>
          <strong>WearUp</strong> isn't just another shopping app. It's a movement — a step toward sustainability and mindful consumption.
          Each second-hand purchase reduces waste and connects like-minded people. The success of WearUp isn’t in the code, but in the
          community it builds — proving that technology can be a force for real-world good.
        </p>
      </section>
    </div>
  );
};

export default WearUpDocs;
