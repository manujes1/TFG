export default function Tabs({ tabs, activa, onChange }) {
  return (
    <div className="border-b border-stone-200 px-2">
      <nav className="flex gap-1 -mb-px" role="tablist">
        {tabs.map((tab) => {
          const esActiva = tab.id === activa;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={esActiva}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-refugio-500 focus-visible:ring-offset-1 rounded-t-md ${
                esActiva
                  ? 'border-refugio-600 text-refugio-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    esActiva ? 'bg-refugio-100 text-refugio-700' : 'bg-stone-100 text-stone-500'
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
