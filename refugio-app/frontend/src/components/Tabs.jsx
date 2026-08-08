/**
 * Navegación por pestañas controlada.
 *
 * @param {{ id: string, label: string, count?: number }[]} tabs
 * @param {string} activa - id de la pestaña activa
 * @param {(id: string) => void} onChange
 */
export default function Tabs({ tabs, activa, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-1 -mb-px" role="tablist">
        {tabs.map((tab) => {
          const esActiva = tab.id === activa;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={esActiva}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                esActiva
                  ? 'border-refugio-600 text-refugio-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    esActiva ? 'bg-refugio-100 text-refugio-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
