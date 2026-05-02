/**
 * Prestamos - Registro y devolución de préstamos con filtros y orden por columna.
 * Lista de herramientas en el modal ordenada alfabéticamente.
 */
import { useState, useEffect, useMemo } from 'react';
import { prestamosAPI, herramientasAPI } from '../api/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ColumnFilter from '../components/ColumnFilter';
import { useToast } from '../components/Toast';
import { ClipboardList, Plus, RotateCcw, Calendar, User, RefreshCw } from 'lucide-react';

const hoy = () => new Date().toISOString().split('T')[0];

const VACIO = {
  herramienta_id: '',
  nombre_vecino: '',
  descripcion_vecino: '',
  fecha_inicio: hoy(),
  fecha_fin: '',
};

const estadoCls = (e) =>
  e === 'devuelto' ? 'badge-success' : e === 'vencido' ? 'badge-danger' : 'badge-blue';

const COLS = [
  { key: 'herramienta_nombre', label: 'Herramienta'  },
  { key: 'nombre_vecino',      label: 'Vecino'       },
  { key: 'descripcion_vecino', label: 'Torre / Apto' },
  { key: 'fecha_inicio',       label: 'Inicio'       },
  { key: 'fecha_fin',          label: 'Fecha límite' },
  { key: 'fecha_devolucion',   label: 'Devuelto'     },
  { key: 'estado',             label: 'Estado'       },
];

export default function Prestamos() {
  const [prestamos, setPrestamos]   = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(VACIO);
  const [guardando, setGuardando]   = useState(false);

  // filtros y orden
  const [filtros, setFiltros] = useState({});  // { columna: [valoresSeleccionados] }
  const [orden, setOrden]     = useState({ key: null, dir: null });
  const toast = useToast();

  const cargar = async () => {
    try {
      setLoading(true); setError(null);
      const [pRes, hRes] = await Promise.all([prestamosAPI.getAll(), herramientasAPI.getAll()]);
      setPrestamos(pRes.data);
      setHerramientas(hRes.data.filter((h) => h.estado === 'activo'));
    } catch { setError('Error al cargar datos'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const cerrar = () => { setShowModal(false); setForm(VACIO); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setGuardando(true);
    try {
      await prestamosAPI.create(form);
      toast.success('Préstamo registrado correctamente');
      cerrar(); cargar();
    } catch (err) { toast.error(err.response?.data?.error || 'Error al crear préstamo'); }
    finally { setGuardando(false); }
  };

  const devolver = async (id) => {
    if (!confirm('¿Confirmar devolución?')) return;
    try {
      await prestamosAPI.devolver(id);
      toast.success('Devolución registrada correctamente');
      cargar();
    }
    catch (err) { toast.error(err.response?.data?.error || 'Error al devolver'); }
  };

  // valores únicos por columna (para los popups de filtro)
  const valoresUnicos = useMemo(() => {
    const out = {};
    for (const { key } of COLS) {
      const set = new Set(prestamos.map((p) => p[key] ?? ''));
      out[key] = Array.from(set).sort((a, b) => String(a).localeCompare(String(b), 'es'));
    }
    return out;
  }, [prestamos]);

  // aplicar filtros + orden
  const visibles = useMemo(() => {
    let arr = prestamos.filter((p) =>
      Object.entries(filtros).every(([k, sel]) =>
        !sel || sel.length === 0 ? true : sel.includes(p[k] ?? '')
      )
    );
    if (orden.key && orden.dir) {
      arr = [...arr].sort((a, b) => {
        const va = a[orden.key] ?? '';
        const vb = b[orden.key] ?? '';
        const cmp = String(va).localeCompare(String(vb), 'es', { numeric: true });
        return orden.dir === 'asc' ? cmp : -cmp;
      });
    }
    return arr;
  }, [prestamos, filtros, orden]);

  const aplicarFiltro = (key, { selected, sortDir }) => {
    setFiltros((prev) => ({ ...prev, [key]: selected }));
    if (sortDir === null && orden.key === key) setOrden({ key: null, dir: null });
    else if (sortDir) setOrden({ key, dir: sortDir });
  };

  if (loading) return <LoadingSpinner />;

  const filtrosActivos = Object.values(filtros).some((s) => s && s.length > 0) || orden.key;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <ClipboardList size={24} className="page-title-icon" />
          <h1>Préstamos</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filtrosActivos && (
            <button className="btn btn-outline" onClick={() => { setFiltros({}); setOrden({ key: null, dir: null }); }}>
              Quitar filtros
            </button>
          )}
          <button className="btn btn-outline" onClick={cargar}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nuevo préstamo
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {COLS.map(({ key, label }) => (
                <th key={key}>
                  <ColumnFilter
                    label={label}
                    values={valoresUnicos[key]}
                    selected={filtros[key] || []}
                    sortDir={orden.key === key ? orden.dir : null}
                    onApply={(payload) => aplicarFiltro(key, payload)}
                  />
                </th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr><td colSpan="8" className="empty-row">No hay préstamos que coincidan</td></tr>
            ) : visibles.map((p) => (
              <tr key={p.id} className={p.estado === 'vencido' ? 'row-danger' : ''}>
                <td>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--primary-dark)' }}>&#x1F527;</span>
                    {p.herramienta_nombre}
                  </strong>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={13} style={{ color: 'var(--text-muted)' }} />
                    {p.nombre_vecino}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {p.descripcion_vecino || '—'}
                </td>
                <td>
                  <span className="date-cell">
                    <Calendar size={12} /> {p.fecha_inicio}
                  </span>
                </td>
                <td>
                  <span className="date-cell">
                    <Calendar size={12} /> {p.fecha_fin}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {p.fecha_devolucion || '—'}
                </td>
                <td>
                  <span className={`badge ${estadoCls(p.estado)}`}>{p.estado}</span>
                </td>
                <td>
                  {p.estado !== 'devuelto' && (
                    <button className="btn btn-sm btn-success" onClick={() => devolver(p.id)}>
                      <RotateCcw size={12} /> Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Nuevo préstamo" icon={ClipboardList} onClose={cerrar}>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Herramienta *</label>
              <select
                value={form.herramienta_id}
                onChange={(e) => setForm({ ...form, herramienta_id: e.target.value })}
                required
              >
                <option value="">Seleccionar herramienta...</option>
                {herramientas
                  .filter((h) => h.cantidad_disponible > 0)
                  .slice()
                  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nombre} — disponibles: {h.cantidad_disponible}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre del vecino *</label>
              <input
                type="text"
                value={form.nombre_vecino}
                onChange={(e) => setForm({ ...form, nombre_vecino: e.target.value })}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="form-group">
              <label>Torre / Apto / Referencia</label>
              <input
                type="text"
                value={form.descripcion_vecino}
                onChange={(e) => setForm({ ...form, descripcion_vecino: e.target.value })}
                placeholder="Ej: Torre 3, Apto 204"
              />
            </div>
            <div className="form-group">
              <label>Fecha inicio *</label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha de devolución esperada *</label>
              <input
                type="date"
                value={form.fecha_fin}
                min={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={cerrar}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Registrando...' : 'Registrar préstamo'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
