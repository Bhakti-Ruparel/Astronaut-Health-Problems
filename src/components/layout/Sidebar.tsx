import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/constants'
import { useApp } from '../../store/AppStore'

export function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const { alerts } = useApp()
  const label = expanded ? 'inline' : 'hidden lg:inline'

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/10 bg-navy transition-[width] duration-200 ${
        expanded ? 'w-60' : 'w-16 lg:w-60'
      }`}
    >
      <nav aria-label="Primary" className="flex-1 space-y-1 p-2 pt-4">
        {NAV_ITEMS.map(({ path, label: text, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            title={text}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-space text-white' : 'text-muted hover:bg-space/60 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-orange transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon size={20} className={isActive ? 'text-cyan' : ''} aria-hidden="true" />
                <span className={label}>{text}</span>
                {path === '/alerts' && alerts.length > 0 && (
                  <span
                    className={`ml-auto rounded-full bg-orange px-1.5 font-mono text-[10px] font-semibold text-navy ${label}`}
                    aria-label={`${alerts.length} active indicators`}
                  >
                    {alerts.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-2 lg:hidden">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={expanded}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted hover:bg-space hover:text-white"
        >
          {expanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>
    </aside>
  )
}
