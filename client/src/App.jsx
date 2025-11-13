import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Meals from './pages/Meals.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BeneficiaryDashboard from './pages/dashboard/BeneficiaryDashboard.jsx';
import MemberDashboard from './pages/dashboard/MemberDashboard.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';

export default function App() {
  return (
    <>
      <NavBar />
       <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/meals" element={<Meals/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />

          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard/>} />
            </Route>

          <Route element={<RoleRoute roles={['beneficiary']} />}>
              <Route path="/dashboard/beneficiary" element={<BeneficiaryDashboard/>} />
            </Route>

          <Route element={<RoleRoute roles={['member','admin']} />}>
              <Route path="/dashboard/member" element={<MemberDashboard/>} />
            </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
