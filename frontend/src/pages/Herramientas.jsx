/**
 * Herramientas - CRUD completo (crear, editar, eliminar) con filtros estilo Excel.
 */
import { useState, useEffect, useMemo } from 'react';
import { herramientasAPI } from '../api/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ColumnFilter from '../components/ColumnFilter';
import { useToast } from '../components/Toast';
import { Wrench, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

const VACIO = { nombre: '', descripcion: '', cantidad_total: 1, estado: 'activo' };

const COLS = [
  { key: 'nombre',              label: 'Herramienta' },
  { key: 'descripcion',         label: 'Descripción' },
  { key: 'cantidad_total',      label: 'Total'       },
  { key: 'cantidad_disponible', label: 'Disponible'  },
  { key: 'estado',              label: 'Estado'      },
];

export default function Herramientas() {
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando]   = useState(null);
  const [form, setForm]           = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  const [filtros, setFiltros] = useState({});
  const [orden, setOrden]     = useState({ key: null, dir: null });
  const toast = useToast();

  const cargar = async () => {
    try {
      setLoading(true); setError(null);
      const res = await herramientasAPI.getAll();
      setHerramientas(res.data);
    } catch { setError('Error al cargar herramientas'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear  = () => { setEditando(null); setForm(VACIO); setShowModal(true); };
  const abrirEditar = (h) => {
    setEditando(h);
    setForm({ nombre: h.nombre, descripcion: h.descripcion, cantidad_total: h.cantidad_total, estado: h.estado });
    setShowModal(true);
  };
  const cerrar = () => { setShowModal(false); setEditando(null); setForm(VACIO); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setGuardando(true);
    try {
      if (editando) {
        await herramientasAPI.update(editando.id, form);
        toast.success('Herramienta actualizada correctamente');
      } else {
        await herramientasAPI.create(form);
        toast.success('Herramienta guardada correctamente');
      }
      cerrar(); cargar();
    } catch (err) { toast.error(err.response?.data?.error || 'Error al guardar'); }
    finally { setGuardando(false); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta herramienta?')) return;
    try {
      await herramientasAPI.delete(id);
      toast.success('Herramienta eliminada');
      cargar();
    } catch (err) { toast.error(err.response?.data?.error || 'Error al eliminar'); }
  };

  const valoresUnicos = useMemo(() => {
    const out = {};
    for (const { key } of COLS) {
      const set = new Set(herramientas.map((h) => h[key] ?? ''));
      out[key] = Array.from(set).sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true }));
    }
    return out;
  }, [herramientas]);

  const visibles = useMemo(() => {
    let arr = herramientas.filter((h) =>
      Object.entries(filtros).every(([k, sel]) =>
        !sel || sel.length === 0 ? true : sel.includes(h[k] ?? '')
      )
    );
    if (orden.key && orden.dir) {
      arr = [...arr].sort((a, b) => {
        const cmp = String(a[orden.key] ?? '').localeCompare(String(b[orden.key] ?? ''), 'es', { numeric: true });
        return orden.dir === 'asc' ? cmp : -cmp;
      });
    }
    return arr;
  }, [herramientas, filtros, orden]);

  const aplicarFiltro = (key, { selected, sortDir }) => {
    setFiltros((prev) => ({ ...prev, [key]: selected }));
    if (sortDir === null && orden.key === key) setOrden({ key: null, dir: null });
    else if (sortDir) setOrden({ key, dir: sortDir });
  };

  const filtrosActivos = Object.values(filtros).some((s) => s && s.length > 0) || orden.key;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <Wrench size={24} className="page-title-icon" />
          <h1>Herramientas</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filtrosActivos && (
            <button className="btn btn-outline" onClick={() => { setFiltros({}); setOrden({ key: null, dir: null }); }}>
              Quitar filtros
            </button>
          )}
          <button className="btn btn-outline" onClick={cargar}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={abrirCrear}>
            <Plus size={16} /> Nueva herramienta
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
              <tr><td colSpan="6" className="empty-row">No hay herramientas que coincidan</td></tr>
            ) : visibles.map((h) => (
              <tr key={h.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Wrench size={14} style={{ color: 'var(--primary-dark)', flexShrink: 0 }} />
                    <strong>{h.nombre}</strong>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{h.descripcion || '—'}</td>
                <td>{h.cantidad_total}</td>
                <td>
                  <span className={`badge ${h.cantidad_disponible === 0 ? 'badge-danger' : 'badge-success'}`}>
                    {h.cantidad_disponible}
                  </span>
                </td>
                <td>
                  <span className={`badge ${h.estado === 'activo' ? 'badge-success' : 'badge-warning'}`}>
                    {h.estado}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => abrirEditar(h)}>
                    <Pencil size={12} /> Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(h.id)}>
                    <Trash2 size={12} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editando ? 'Editar herramienta' : 'Nueva herramienta'} icon={Wrench} onClose={cerrar}>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Taladro eléctrico..."
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Detalles, modelo, accesorios..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Cantidad total *</label>
              <input
                type="number"
                min="1"
                value={form.cantidad_total}
                onChange={(e) => setForm({ ...form, cantidad_total: Number(e.target.value) })}
                required
              />
            </div>
            {editando && (
              <div className="form-group">
                <label>Estado *</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={cerrar}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
