import { useEffect, useState } from 'react';
import { list, send } from '../api';

const pad = (n) => String(n).padStart(2, '0');

export default function Manager({ kind, sheet, eyebrow, title, fields, password }) {
  const isProject = kind === 'project';
  const word = isProject ? 'PROJECT' : 'SKILL';

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = form._row !== undefined;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await list(sheet));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOpen(false);
    setForm({});
    setFilter('Semua');
    load();
  }, [sheet]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const openAdd = () => {
    setForm({});
    setError('');
    setOpen(true);
  };
  const openEdit = (row) => {
    setForm(row);
    setError('');
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setForm({});
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await send(editing ? 'update' : 'create', sheet, form, password);
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await send('delete', sheet, { _row: row._row }, password);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const categories = isProject
    ? ['Semua', ...new Set(rows.map((r) => String(r.category || '').trim()).filter(Boolean))]
    : [];
  const shown =
    isProject && filter !== 'Semua'
      ? rows.filter((r) => String(r.category || '').trim() === filter)
      : rows;

  const renderInput = (f) => {
    const common = {
      name: f.name,
      required: f.required,
      value: form[f.name] ?? '',
      onChange: handleChange,
    };
    if (f.type === 'textarea') return <textarea rows="3" {...common} />;
    if (f.type === 'select') {
      return (
        <select {...common}>
          <option value="">-- pilih --</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    return <input type={f.type} {...common} />;
  };

  const ProjectCard = ({ row, i }) => {
    const tech = String(row.tech || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return (
      <article className="pcard">
        <div className="pcard-head">
          <span className="num">
            {pad(i + 1)}
            <b>PROJECT</b>
          </span>
          {row.status && <span className={`badge ${row.status}`}>{row.status}</span>}
        </div>
        {row.image && <img className="pcard-img" src={row.image} alt="" />}
        <p className="meta">
          {[row.category, row.year].filter(Boolean).join(' · ')}
        </p>
        <h3>{row.title}</h3>
        {row.description && <p className="desc">{row.description}</p>}
        {tech.length > 0 && <p className="tech">{tech.join(' · ')}</p>}
        <div className="links">
          {row.demoUrl && (
            <a href={row.demoUrl} target="_blank" rel="noreferrer">
              Demo ↗
            </a>
          )}
          {row.repoUrl && (
            <a href={row.repoUrl} target="_blank" rel="noreferrer">
              Source ↗
            </a>
          )}
        </div>
        <div className="card-actions">
          <button className="pill" onClick={() => openEdit(row)}>
            Edit
          </button>
          <button className="pill danger" onClick={() => handleDelete(row)}>
            Hapus
          </button>
        </div>
      </article>
    );
  };

  const SkillCard = ({ row, i }) => {
    const level = Math.max(0, Math.min(100, Number(row.level) || 0));
    return (
      <article className="pcard">
        <div className="pcard-head">
          <span className="num">
            {pad(i + 1)}
            <b>SKILL</b>
          </span>
          <span className="meta">{level}%</span>
        </div>
        <h3>{row.name}</h3>
        <div className="bar">
          <span style={{ width: `${level}%` }} />
        </div>
        <div className="card-actions">
          <button className="pill" onClick={() => openEdit(row)}>
            Edit
          </button>
          <button className="pill danger" onClick={() => handleDelete(row)}>
            Hapus
          </button>
        </div>
      </article>
    );
  };

  return (
    <section>
      <p className="eyebrow">{eyebrow}</p>
      <div className="title-row">
        <h1>{title}</h1>
        <button className="btn" onClick={openAdd}>
          + Tambah {isProject ? 'Project' : 'Skill'}
        </button>
      </div>

      {isProject && categories.length > 1 && (
        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${filter === c ? 'on' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {error && !open && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">Memuat data...</p>
      ) : shown.length === 0 ? (
        <div className="empty">
          <p>Belum ada {word.toLowerCase()}.</p>
          <button className="btn" onClick={openAdd}>
            + Tambah {isProject ? 'Project' : 'Skill'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid">
            {shown.map((row, i) =>
              isProject ? (
                <ProjectCard key={row._row} row={row} i={i} />
              ) : (
                <SkillCard key={row._row} row={row} i={i} />
              )
            )}
          </div>
          <p className="count">
            MENAMPILKAN <b>{shown.length}</b> / {rows.length} {word}
          </p>
        </>
      )}

      {open && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="modal" onSubmit={handleSubmit}>
            <div className="modal-head">
              <h3>
                {editing ? 'Edit' : 'Tambah'} {isProject ? 'Project' : 'Skill'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {fields.map((f) => (
                <label key={f.name}>
                  {f.label}
                  {renderInput(f)}
                </label>
              ))}
              {error && <p className="error">{error}</p>}
            </div>
            <div className="modal-foot">
              <button type="button" className="pill" onClick={closeModal}>
                Batal
              </button>
              <button className="btn" disabled={saving}>
                {saving ? 'Menyimpan...' : editing ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}