import { Component } from "react";

// Captura errores de render en todo el árbol. Sin esto, un error lanzado durante
// el render desmonta toda la app y deja la pantalla en blanco. Aquí mostramos un
// mensaje claro con opción de recargar, en vez de una pantalla vacía.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Queda en la consola para diagnóstico (y a futuro, para enviar a Sentry).
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0] p-6">
          <div className="max-w-sm w-full text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <p className="text-lg font-semibold text-gray-900 mb-2">Algo salió mal</p>
            <p className="text-sm text-gray-500 mb-6">
              Ocurrió un error al mostrar esta pantalla. Intenta recargar.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
