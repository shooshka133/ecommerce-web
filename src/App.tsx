import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useStore } from "./store/useStore";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetails } from "./pages/ProductDetails";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { Contact } from "./pages/Contact";
import { Orders } from "./pages/Orders";
import { AuthPromptModal } from "./components/AuthPromptModal";

import { useAuth } from "./context/AuthContext";

function App() {
  const { session, loading } = useAuth();
  console.log("session:", session, "loading:", loading);

  const { darkMode } = useStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
      <AuthPromptModal />
    </div>
  );
}

export default App;

// import { useEffect } from "react";
// import { useStore } from "./store/useStore";
// import { Navbar } from "./components/Navbar";
// import { Footer } from "./components/Footer";
// import { Home } from "./pages/Home";
// import { Shop } from "./pages/Shop";
// import { ProductDetails } from "./pages/ProductDetails";
// import { Cart } from "./pages/Cart";
// import { Checkout } from "./pages/Checkout";
// import { Login } from "./pages/Login";
// import { Contact } from "./pages/Contact";
// import { Orders } from "./pages/Orders";
// import { AuthPromptModal } from "./components/AuthPromptModal";

// function App() {
//   const { darkMode } = useStore();

//   useEffect(() => {
//     // Apply dark mode class when darkMode changes
//     // Zustand persist will rehydrate the state from localStorage automatically
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   return (
//     <Router>
//       <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
//         <Navbar />
//         <main className="flex-grow">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/shop" element={<Shop />} />
//             <Route path="/product/:id" element={<ProductDetails />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/checkout" element={<Checkout />} />
//             <Route path="/orders" element={<Orders />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/contact" element={<Contact />} />
//           </Routes>
//         </main>
//         <Footer />
//         <AuthPromptModal />
//       </div>
//     </Router>
//   );
// }

// export default App;
