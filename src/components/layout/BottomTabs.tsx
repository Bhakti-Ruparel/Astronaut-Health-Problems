import { Ellipsis } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/constants'
import { useApp } from '../../store/AppStore'
import { MoreSheet } from './MoreSheet'

export function BottomTabs() {
  const { alerts } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setMoreOpen(false), [])
  const tabs = NAV_ITEMS.filter((n) => n.mobile === 'tab')

  const base = 'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium'

  return (
    <>
      <nav
        aria-label="Primary mobile"
        className="glass-strong fixed inset-x-0 bottom-0 z-40 rounded-t-[24px] border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="flex h-16 items-stretch px-2">
          {tabs.map(({ path, short, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              aria-label={label}
              className={({ isActive }) => `${base} ${isActive ? 'text-white' : 'text-muted'}`}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-[transform,background-color,box-shadow] duration-200 ${
                      isActive
                        ? '-translate-y-1 bg-linear-to-br from-cyan to-violet text-void shadow-[0_0_20px_rgb(85_198_232/0.6)]'
                        : ''
                    }`}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {path === '/alerts' && alerts.length > 0 && (
                      <span
                        className="num absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-void"
                        role="img"
                        aria-label={`${alerts.length} active indicators`}
                      >
                        {alerts.length}
                      </span>
                    )}
                  </span>
                  <span aria-hidden="true">{short}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            ref={moreRef}
            type="button"
            className={`${base} text-muted`}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            aria-label="More"
            onClick={() => setMoreOpen(true)}
          >
            <span className="flex h-9 w-9 items-center justify-center">
              <Ellipsis size={20} aria-hidden="true" />
            </span>
            <span aria-hidden="true">More</span>
          </button>
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={close} returnFocusTo={moreRef} />
    </>
  )
}
