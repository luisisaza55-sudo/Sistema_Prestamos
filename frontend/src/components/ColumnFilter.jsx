/**
 * ColumnFilter - Filtro estilo Excel para encabezados de tabla.
 * Incluye ordenar A->Z / Z->A, búsqueda y selección múltiple por checkbox.
 * Usa createPortal para escapar del overflow del contenedor.
 */
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Filter, ArrowUpAZ, ArrowDownZA, Search, X } from 'lucide-react';

/**
 * Encabezado de columna con filtro estilo Excel.
 * Props:
 *  - label, values, selected, sortDir, onApply
 */
export default function ColumnFilter({ label, values, selected, sortDir, onApply }) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [tmp, setTmp] = useState(selected);
  const [tmpSort, setTmpSort] = useState(sortDir);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => { setTmp(selected); setTmpSort(sortDir); }, [selected, sortDir, open]);

  // Calcular posición del popup cuando se abre
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popupWidth = 260;
    const popupHeight = 380;
    const margin = 8;

    let left = rect.left;
    let top = rect.bottom + 6;

    // Si se sale por la derecha, alinear a la derecha del botón
    if (left + popupWidth > window.innerWidth - margin) {
      left = Math.max(margin, rect.right - popupWidth);
    }
    // Si se sale por abajo, abrir hacia arriba
    if (top + popupHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - popupHeight - 6);
    }

    setPos({ top, left });
  }, [open]);

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const filtrados = values.filter((v) =>
    String(v).toLowerCase().includes(busqueda.toLowerCase())
  );

  const todosMarcados = filtrados.length > 0 && filtrados.every((v) => tmp.includes(v));

  const toggle = (v) =>
    setTmp((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const toggleTodos = () =>
    setTmp((prev) => (todosMarcados
      ? prev.filter((v) => !filtrados.includes(v))
      : [...new Set([...prev, ...filtrados])]
    ));

  const aplicar = (overrides = {}) => {
    onApply({
      selected: overrides.selected !== undefined ? overrides.selected : tmp,
      sortDir:  overrides.sortDir  !== undefined ? overrides.sortDir  : tmpSort,
    });
    setOpen(false);
  };

  const limpiar = () => {
    setTmp(values);
    setTmpSort(null);
    onApply({ selected: [], sortDir: null });
    setOpen(false);
  };

  const filtroActivo = selected.length > 0 && selected.length < values.length;
  const ordenActivo = !!sortDir;

  const popup = open && (
    <div
      ref={popupRef}
      className="col-filter-popup"
      style={{ top: pos.top, left: pos.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="col-filter-sort">
        <button
          type="button"
          className={`col-filter-sort-btn ${tmpSort === 'asc' ? 'active' : ''}`}
          onClick={() => aplicar({ sortDir: tmpSort === 'asc' ? null : 'asc' })}
        >
          <ArrowUpAZ size={14} /> Ordenar A → Z
        </button>
        <button
          type="button"
          className={`col-filter-sort-btn ${tmpSort === 'desc' ? 'active' : ''}`}
          onClick={() => aplicar({ sortDir: tmpSort === 'desc' ? null : 'desc' })}
        >
          <ArrowDownZA size={14} /> Ordenar Z → A
        </button>
      </div>

      <div className="col-filter-search">
        <Search size={13} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          autoFocus
        />
      </div>

      <div className="col-filter-list">
        <label className="col-filter-item col-filter-all">
          <input type="checkbox" checked={todosMarcados} onChange={toggleTodos} />
          <strong>(Seleccionar todo)</strong>
        </label>
        {filtrados.length === 0 ? (
          <div className="col-filter-empty">Sin resultados</div>
        ) : filtrados.map((v) => (
          <label key={String(v)} className="col-filter-item">
            <input type="checkbox" checked={tmp.includes(v)} onChange={() => toggle(v)} />
            <span>{v === '' || v === null ? <em>(vacío)</em> : String(v)}</span>
          </label>
        ))}
      </div>

      <div className="col-filter-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={limpiar}>
          <X size={12} /> Limpiar
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => aplicar()}>
          Aplicar
        </button>
      </div>
    </div>
  );

  return (
    <div className="col-filter">
      <span className="col-filter-label">{label}</span>
      <button
        ref={btnRef}
        type="button"
        className={`col-filter-btn ${filtroActivo || ordenActivo ? 'col-filter-btn--active' : ''}`}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        title="Filtrar / Ordenar"
      >
        <Filter size={12} />
      </button>
      {open && createPortal(popup, document.body)}
    </div>
  );
}
