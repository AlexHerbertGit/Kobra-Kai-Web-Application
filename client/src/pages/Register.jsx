import { useState } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('beneficiary');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e){
    e.preventDefault(); setErr('');
    try { await register({ name, address, email, password, role }); nav('/dashboard'); }
    catch(ex){ setErr(ex.message); }
  }

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={onSubmit} className="grid">
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <label>Register as</label>
        <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="beneficiary">Beneficiary</option>
          <option value="member">Member</option>
        </select>
        <label>Name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} required/>
        <label>Address</label>
        <input className="input" value={address} onChange={e=>setAddress(e.target.value)} required/>
        <label>Email</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button className="btn">Create Account</button>
      </form>
    </div>
  );
}