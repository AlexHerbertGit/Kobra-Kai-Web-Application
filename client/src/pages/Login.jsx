import { useState } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e){
    e.preventDefault(); setErr('');
    try { await login(email, password); nav('/dashboard'); }
    catch(ex){ setErr(ex.message); }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={onSubmit} className="grid">
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <label>Email</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <button className="btn">Login</button>
      </form>
    </div>
  );
}