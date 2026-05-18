import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import ItineraryPage from "./pages/ItineraryPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !shadow-lg !rounded-xl",
          duration: 4000,
        }}
      />
    </BrowserRouter>
  );
}
