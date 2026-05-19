import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import PostIdea from './pages/PostIdea';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import LegalDoc from './pages/LegalDoc';
import Footer from './components/Footer';
import { supabase } from './supabaseClient';

function App() {
  useEffect(() => {
    // Increment visit count silently on app load
    const incrementVisit = async () => {
      try {
        await supabase.rpc('increment_visits');
      } catch (err) {
        // Silently fail if RPC doesn't exist yet
      }
    };
    incrementVisit();
  }, []);
  return (
    <Router>
      <div className="bg-blob"></div>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/post" element={<PostIdea />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/legal/:id" element={<LegalDoc />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
