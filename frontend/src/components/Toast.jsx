/**
 * Toast - Sistema global de notificaciones flotantes (verde / rojo / amarillo).
 * Provee ToastProvider y el hook useToast(). Auto-cierra a los 3.5s.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((mensaje, tipo = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const api = {
    success: (msg) => show(msg, 'success'),
    error:   (msg) => show(msg, 'error'),
    warning: (msg) => show(msg, 'warning'),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ mensaje, tipo, onClose }) {
  const [saliendo, setSaliendo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSaliendo(true), 3100);
    return () => clearTimeout(t);
  }, []);

  const Icon = tipo === 'success' ? CheckCircle2 : tipo === 'error' ? XCircle : AlertTriangle;

  return (
    <div className={`toast toast-${tipo} ${saliendo ? 'toast-out' : ''}`}>
      <div className="toast-icon"><Icon size={22} strokeWidth={2.4} /></div>
      <div className="toast-msg">{mensaje}</div>
      <button className="toast-close" onClick={onClose}><X size={14} /></button>
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast debe estar dentro de <ToastProvider>');
  return ctx;
};
