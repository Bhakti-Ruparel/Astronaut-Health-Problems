import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/constants'
import { useApp } from '../../store/AppStore'
import { Wordmark } from '../ui/Wordmark'

export function Sidebar() {
  const { alerts } = useApp()

  return (
    <aside className="sticky top-5 ml-5 hidden h-[calc(100vh-2.5rem)] w-[72px] shrink-0 md:block lg:w-[248px]">
      <div className="glass-strong flex h-full flex-col rounded-[28px] p-3">
        <div className="flex h-12 items-center justify-center px-1 lg:justify-start lg:px-2">
          <span className="lg:hidden" aria-hidden="true">
            <Wordmark className="[&>span:last-child]:hidden" />
          </span>
          <span className="hidden lg:inline">
            <Wordmark />
          </span>
        </div>
        <nav aria-label="Primary" className="mt-4 flex-1 space-y-1.5">
          {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `group relative flex min-h-11 items-center justify-center gap-3 rounded-full border px-3 py-2.5 text-sm font-medium transition-[background-color,border-color,box-shadow,color] duration-200 lg:justify-start ${
                  isActive
                    ? 'border-cyan/60 bg-linear-to-r from-violet/30 to-cyan/20 text-white shadow-[0_0_22px_rgb(85_198_232/0.3)]'
                    : 'border-transparent text-muted hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className={isActive ? 'text-cyan-bright drop-shadow-[0_0_6px_rgb(125_227_255/0.8)]' : ''}
                  />
                  <span className="hidden lg:inline" aria-hidden="true">
                    {label}
                  </span>
                  {path === '/alerts' && alerts.length > 0 && (
                    <span
                      className="num absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-void lg:static lg:ml-auto lg:h-5 lg:min-w-5 lg:text-xs"
                      role="img"
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
        <div
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 lg:flex"
          title="Simulated link: no real telemetry is connected"
        >
          <span className="pulse-dot h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
          <span className="text-xs text-muted">Simulated link</span>
        </div>
      </div>
    </aside>
  )
}
