/**
 * Alertas - Lista de préstamos vencidos en formato de tarjetas.
 * Permite marcar como devuelto desde la misma vista.
 */
import { useState, useEffect } from 'react';
import { prestamosAPI } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { AlertTriangle, RotateCcw, Wrench, User, MapPin, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Alertas() {
  const [vencidos, setVencidos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const toast = useToast();

  const cargar = async () => {
    try {
      setLoading(true); setError(null);
      const res = await prestamosAPI.getVencidos();
      setVencidos(res.data);
    } catch { setError('Error al cargar alertas'); }
    finally  { setLoading(false); }
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

  useEffect(() => { cargar(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <AlertTriangle size={24} className="page-title-icon" style={{ color: 'var(--danger)' }} />
          <h1>Alertas — Préstamos Vencidos</h1>
        </div>
        <button className="btn btn-outline" onClick={cargar}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {vencidos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CheckCircle2 size={32} />
          </div>
          <h2>Sin alertas</h2>
          <p>No hay préstamos vencidos en este momento.</p>
        </div>
      ) : (
        <>
          <div className="alert-banner">
            <AlertTriangle size={18} />
            {vencidos.length} préstamo(s) vencido(s) requieren atención inmediata
          </div>
          <div className="alert-cards">
            {vencidos.map((p) => (
              <div key={p.id} className="alert-card">
                <div className="alert-card-header">
                  <span className="badge badge-danger">VENCIDO</span>
                  <span className="alert-fecha">
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Venció el {p.fecha_fin}
                  </span>
                </div>
                <div className="alert-card-body">
                  <div className="alert-row">
                    <Wrench size={14} className="alert-row-icon" />
                    <strong>Herramienta:</strong>&nbsp;{p.herramienta_nombre}
                  </div>
                  <div className="alert-row">
                    <User size={14} className="alert-row-icon" />
                    <strong>Vecino:</strong>&nbsp;{p.nombre_vecino}
                  </div>
                  {p.descripcion_vecino && (
                    <div className="alert-row">
                      <MapPin size={14} className="alert-row-icon" />
                      <strong>Referencia:</strong>&nbsp;{p.descripcion_vecino}
                    </div>
                  )}
                  <div className="alert-row">
                    <Calendar size={14} className="alert-row-icon" />
                    <strong>Prestado desde:</strong>&nbsp;{p.fecha_inicio}
                  </div>
                </div>
                <div className="alert-card-footer">
                  <button className="btn btn-success" onClick={() => devolver(p.id)}>
                    <RotateCcw size={14} /> Marcar como devuelto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
