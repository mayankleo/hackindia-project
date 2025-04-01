import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from './utils/WalletContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Verify from './pages/Verify';
import SuperUserDashboard from './pages/SuperUserDashboard';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div>
          <Navbar />
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/superuser-dashboard" element={<SuperUserDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/verify" element={<Verify />} />
            </Routes>
          </div>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
