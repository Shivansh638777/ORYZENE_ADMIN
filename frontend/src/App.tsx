import { useEffect, useState, type FormEvent } from 'react';
import './App.css';

type Role = 'ADMIN' | 'TEAM_LEAD' | 'PARTICIPANT';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

type Registration = {
  id: string;
  userId: string;
  ign: string;
  bgmiId: string;
  teamName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: User;
};

const API_URL = 'http://localhost:4000/api';

function App() {
  const [me, setMe] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    ign: '',
    bgmiId: '',
    teamName: '',
    password: '',
  });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    void loadRegistrations();
  }, []);

  async function loadRegistrations() {
    const response = await fetch(`${API_URL}/registrations`);
    if (response.ok) {
      const data = (await response.json()) as Registration[];
      setRegistrations(data);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Registration failed.');
      return;
    }

    setMessage('Registration submitted successfully. The organizer will review it soon.');
    setForm({ name: '', email: '', phone: '', ign: '', bgmiId: '', teamName: '', password: '' });
    void loadRegistrations();
  }

  async function handleAdminLogin(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      setAdminMessage(data.message || 'Admin login failed.');
      return;
    }

    setMe(data.user);
    setIsAdminLoggedIn(data.user.role === 'ADMIN');
    setAdminMessage('Organizer access granted.');
    void loadRegistrations();
  }

  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
    setMe(null);
    setAdminMessage('Logged out.');
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">BGMI Tournament • Public Registration</p>
          <h1>ORYZENE BGMI Showdown</h1>
          <p>
            Register for a high-energy BGMI tournament with squad battles, prize money,
            live check-ins, and a smooth organizer experience.
          </p>
          <div className="hero-actions">
            <a href="#register" className="btn primary">Register Now</a>
            <a href="#organizer" className="btn secondary">Organizer Login</a>
          </div>
          <div className="pill-row">
            <span>Game: BGMI</span>
            <span>Format: Squad</span>
            <span>Prize Pool: ₹25,000+</span>
            <span>Venue: Delhi</span>
          </div>
        </div>
      </header>

      {message ? <div className="status-card">{message}</div> : null}

      <section className="stats-grid">
        <div className="stat-card">
          <strong>16+</strong>
          <span>Teams</span>
        </div>
        <div className="stat-card">
          <strong>₹25k</strong>
          <span>Prize Pool</span>
        </div>
        <div className="stat-card">
          <strong>QR</strong>
          <span>Check-in</span>
        </div>
      </section>

      <main className="content-grid">
        <section id="register" className="card">
          <h2>Register now</h2>
          <form onSubmit={handleRegister} className="stack">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" required />
            <input value={form.ign} onChange={(e) => setForm({ ...form, ign: e.target.value })} placeholder="In-game name" required />
            <input value={form.bgmiId} onChange={(e) => setForm({ ...form, bgmiId: e.target.value })} placeholder="BGMI ID" required />
            <input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} placeholder="Team name (optional)" />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password" type="password" required />
            <button type="submit">Submit registration</button>
          </form>
        </section>

        <section className="card">
          <h2>Event details</h2>
          <ul className="detail-list">
            <li>Open for BGMI squads and duo teams.</li>
            <li>Entry is free for early registration.</li>
            <li>Prize pool includes cash rewards and tournament goodies.</li>
            <li>Each approved participant receives a ticket and QR-based check-in.</li>
          </ul>
          <div className="info-box">
            <h3>Event format</h3>
            <p>Squad-based battles, bracket-style progression, and a live venue check-in experience.</p>
          </div>
        </section>
      </main>

      <section className="card section-card">
        <h2>How the event will work</h2>
        <div className="timeline">
          <div className="timeline-item">
            <strong>1. Register</strong>
            <p>Fill out the form with your BGMI details and team information.</p>
          </div>
          <div className="timeline-item">
            <strong>2. Approval</strong>
            <p>The organizer reviews your entry and approves it before the ticket is generated.</p>
          </div>
          <div className="timeline-item">
            <strong>3. Play</strong>
            <p>Once approved, you get your ticket, check-in details, and event updates.</p>
          </div>
        </div>
      </section>

      <section id="organizer" className="card admin-card">
        <div className="section-heading">
          <h2>Organizer access</h2>
          <p>This section is only for the tournament organizer.</p>
        </div>
        {isAdminLoggedIn ? (
          <div className="stack">
            <p>Welcome, {me?.name}.</p>
            <button className="secondary" onClick={handleAdminLogout}>Logout</button>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>IGN</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td>{registration.user?.name || registration.userId}</td>
                      <td>{registration.ign}</td>
                      <td>{registration.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="stack">
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Organizer email" required />
            <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" type="password" required />
            <button type="submit">Login as organizer</button>
            {adminMessage ? <p className="admin-message">{adminMessage}</p> : null}
          </form>
        )}
      </section>
    </div>
  );
}

export default App;
