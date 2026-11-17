import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Manager from './pages/Manager';

const projectFields = [
  { name: 'title', label: 'Judul', type: 'text', required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea' },
  { name: 'tech', label: 'Tech (pisahkan koma)', type: 'text' },
  { name: 'demoUrl', label: 'Demo URL', type: 'url' },
  { name: 'repoUrl', label: 'Repo URL', type: 'url' },
  { name: 'image', label: 'URL Gambar', type: 'url' },
  { name: 'category', label: 'Kategori (Kuliah / Pribadi)', type: 'text' },
  { name: 'year', label: 'Tahun', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: ['on-going', 'completed'] },
];

const skillFields = [
  { name: 'name', label: 'Nama Skill', type: 'text', required: true },
  { name: 'level', label: 'Level (0-100)', type: 'number' },
];

export default function App() {
  const [password, setPassword] = useState(sessionStorage.getItem('admin_pw') || '');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const handleLogin = (pw) => {
    sessionStorage.setItem('admin_pw', pw);
    setPassword(pw);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pw');
    setPassword('');
  };

  if (!password) return <Login onLogin={handleLogin} />;

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <span className="brand">
            Daffa Abrar <small>ADMIN</small>
          </span>
          <nav className="nav-links">
            <NavLink to="/projects">Project</NavLink>
            <NavLink to="/skills">Skill</NavLink>
          </nav>
          <div className="nav-right">
            <button
              className="icon-btn"
              title="Ganti tema"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '☀' : '☾'}
            </button>
            <button className="pill" onClick={handleLogout}>
              Logout ↗
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route
            path="/projects"
            element={
              <Manager
                kind="project"
                sheet="projects"
                eyebrow="01 DEVELOPER LOGS"
                title="Project Saya."
                fields={projectFields}
                password={password}
              />
            }
          />
          <Route
            path="/skills"
            element={
              <Manager
                kind="skill"
                sheet="skills"
                eyebrow="02 KEMAMPUAN"
                title="Skill Saya."
                fields={skillFields}
                password={password}
              />
            }
          />
        </Routes>
      </main>
    </>
  );
}