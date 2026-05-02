/**
 * LoadingSpinner - Indicador de carga circular animado.
 */
export default function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <span className="spinner-text">Cargando...</span>
    </div>
  );
}
