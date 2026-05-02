/**
 * Dashboard - Tarjetas de estadísticas + tabla filtrable.
 * Al hacer click en una card se filtra la tabla; click de nuevo desactiva.
 */
import { useState, useEffect, useMemo } from 'react';
import { informesAPI, prestamosAPI, herramientasAPI } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ColumnFilter from '../components/ColumnFilter';
import { Wrench, ClipboardList, AlertTriangle, Package, RefreshCw, LayoutDashboard, Calendar, User } from 'lucide-react';

const CARDS = [
  { key: 'total_herramientas',     label: 'Total Herramientas', icon: Wrench,        cls: 'card-yellow' },
  { key: 'prestamos_activos',      label: 'Préstamos Activos',  icon: ClipboardList, cls: 'card-blue'   },
  { key: 'prestamos_vencidos',     label: 'Préstamos Vencidos', icon: AlertTriangle, cls: 'card-red'    },
  { key: 'herramientas_sin_stock', label: 'Sin Stock',          icon: Package,       cls: 'card-orange' },
];

const COLS_PRESTAMOS = [
  { key: 'herramienta_nombre', label: 'Herramienta'  },
  { key: 'nombre_vecino',      label: 'Vecino'       },
  { key: 'descripcion_vecino', label: 'Torre / Apto' },
  { key: 'fecha_inicio',       label: 'Inicio'       },
  { key: 'fecha_fin',          label: 'Fecha límite' },
  { key: 'estado',             label: 'Estado'       },
];

const COLS_HERR = [
  { key: 'nombre',              label: 'Herramienta' },
  { key: 'descripcion',         label: 'Descripción' },
  { key: 'cantidad_total',      label: 'Total'       },
  { key: 'cantidad_disponible', label: 'Disponibles' },
  { key: 'estado',              label: 'Estado'      },
];

const estadoCls = (e) =>
  e === 'devuelto' ? 'badge-success' : e === 'vencido' ? 'badge-danger' : 'badge-blue';

export default function Dashboard() {
  const [resumen, setResumen]         = useState(null);
  const [prestamos, setPrestamos]     = useState([]);
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);

  const [filtros, setFiltros] = useState({});
  const [orden, setOrden]     = useState({ key: null, dir: null });

  const cargar = async () => {
    try {
      setLoading(true); setError(null);
      const [rRes, pRes, hRes] = await Promise.all([
        informesAPI.resumen(),
        prestamosAPI.getAll(),
        herramientasAPI.getAll(),
      ]);
      setResumen(rRes.data);
      setPrestamos(pRes.data);
      setHerramientas(hRes.data);
    } catch {
      setError('No se pudo conectar con el servidor. Verifique que el backend esté corriendo en el puerto 3002.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (key) => {
    setSeleccionada((prev) => (prev === key ? null : key));
    setFiltros({}); setOrden({ key: null, dir: null });
  };

  const datosBase = () => {
    if (seleccionada === 'total_herramientas')     return { tipo: 'herramientas', items: herramientas };
    if (seleccionada === 'prestamos_activos')      return { tipo: 'prestamos',    items: prestamos.filter((p) => p.estado === 'prestado') };
    if (seleccionada === 'prestamos_vencidos')     return { tipo: 'prestamos',    items: prestamos.filter((p) => p.estado === 'vencido')  };
    if (seleccionada === 'herramientas_sin_stock') return { tipo: 'herramientas', items: herramientas.filter((h) => h.cantidad_disponible === 0) };
    return { tipo: 'prestamos', items: prestamos };
  };

  const { tipo, items: itemsBase } = useMemo(datosBase, [seleccionada, prestamos, herramientas]);
  const COLS = tipo === 'prestamos' ? COLS_PRESTAMOS : COLS_HERR;

  const valoresUnicos = useMemo(() => {
    const out = {};
    for (const { key } of COLS) {
      const set = new Set(itemsBase.map((x) => x[key] ?? ''));
      out[key] = Array.from(set).sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true }));
    }
    return out;
  }, [itemsBase, COLS]);

  const items = useMemo(() => {
    let arr = itemsBase.filter((row) =>
      Object.entries(filtros).every(([k, sel]) =>
        !sel || sel.length === 0 ? true : sel.includes(row[k] ?? '')
      )
    );
    if (orden.key && orden.dir) {
      arr = [...arr].sort((a, b) => {
        const cmp = String(a[orden.key] ?? '').localeCompare(String(b[orden.key] ?? ''), 'es', { numeric: true });
        return orden.dir === 'asc' ? cmp : -cmp;
      });
    }
    return arr;
  }, [itemsBase, filtros, orden]);

  const aplicarFiltro = (key, { selected, sortDir }) => {
    setFiltros((prev) => ({ ...prev, [key]: selected }));
    if (sortDir === null && orden.key === key) setOrden({ key: null, dir: null });
    else if (sortDir) setOrden({ key, dir: sortDir });
  };

  const filtrosActivos = Object.values(filtros).some((s) => s && s.length > 0) || orden.key;

  useEffect(() => { cargar(); }, []);

  if (loading) return <LoadingSpinner />;

  const cardActiva = CARDS.find((c) => c.key === seleccionada);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <LayoutDashboard size={24} className="page-title-icon" />
          <h1>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filtrosActivos && (
            <button className="btn btn-outline" onClick={() => { setFiltros({}); setOrden({ key: null, dir: null }); }}>
              Quitar filtros
            </button>
          )}
          <button className="btn btn-outline" onClick={cargar}>
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {resumen && (
        <div className="stats-grid">
          {CARDS.map(({ key, label, icon: Icon, cls }) => (
            <div
              key={key}
              className={`stat-card ${cls}${seleccionada === key ? ' stat-card--active' : ''}`}
              onClick={() => toggleCard(key)}
            >
              <div className="stat-icon"><Icon size={24} strokeWidth={2} /></div>
              <div>
                <div className="stat-value">{resumen[key]}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">
            {cardActiva ? cardActiva.label : 'Todos los Préstamos'}
          </h2>
          <span className="badge badge-blue">{items.length} registro{items.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-container">
          {tipo === 'prestamos' ? (
            <table className="table">
              <thead>
                <tr>
                  {COLS_PRESTAMOS.map(({ key, label }) => (
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
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="6" className="empty-row">Sin registros</td></tr>
                ) : items.map((p) => (
                  <tr key={p.id} className={p.estado === 'vencido' ? 'row-danger' : ''}>
                    <td><strong>{p.herramienta_nombre}</strong></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <User size={13} style={{ color: 'var(--text-muted)' }} />
                        {p.nombre_vecino}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.descripcion_vecino || '—'}</td>
                    <td><span className="date-cell"><Calendar size={12} /> {p.fecha_inicio}</span></td>
                    <td><span className="date-cell"><Calendar size={12} /> {p.fecha_fin}</span></td>
                    <td><span className={`badge ${estadoCls(p.estado)}`}>{p.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  {COLS_HERR.map(({ key, label }) => (
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
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="5" className="empty-row">Sin registros</td></tr>
                ) : items.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Wrench size={14} style={{ color: 'var(--primary-dark)' }} />
                        {h.nombre}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{h.descripcion || '—'}</td>
                    <td>{h.cantidad_total}</td>
                    <td>
                      <span className={h.cantidad_disponible === 0 ? 'badge badge-danger' : 'badge badge-success'}>
                        {h.cantidad_disponible}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${h.estado === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                        {h.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
