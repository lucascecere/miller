const sectors = [
  {
    name: 'Financial Services',
    clients: ['Morningstar', 'Neuberger Berman', 'American Express', 'Ventas', 'StanCorp Financial Group', 'Hedge funds & family offices', 'Endowments'],
  },
  {
    name: 'Technology & AI',
    clients: ['Oracle', 'Salesforce', 'HPE', 'Amazon'],
  },
  {
    name: 'Energy & Infrastructure',
    clients: ['Energy Transfer', 'UGI'],
  },
  {
    name: 'Insurance & Healthcare',
    clients: ['Delta Dental', 'Amgen', 'Marsh McLennan', 'VNS Health'],
  },
  {
    name: 'Manufacturing & Distribution',
    clients: ['PepsiCo', 'UPS', 'Michelin', 'Harman', 'Lennox International'],
  },
  {
    name: 'Mission-Driven Organizations',
    clients: ['National Geographic', 'The Nature Conservancy'],
  },
]

export function EngagementList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {sectors.map((sector) => (
        <div key={sector.name}>
          <h3 className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-3">
            {sector.name}
          </h3>
          <ul className="space-y-1">
            {sector.clients.map((client) => (
              <li key={client} className="text-sm text-lm-cream-muted">
                {client}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
