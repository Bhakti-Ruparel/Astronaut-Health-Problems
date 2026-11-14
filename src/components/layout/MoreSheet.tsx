import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/constants'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function MoreSheet({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean
  onClose: () => void
  returnFocusTo: React.RefObject<HTMLElement | null>
}) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const sheet = sheetRef.current
    const returnTarget = returnFocusTo.current
    sheet?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !sheet) return
      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      returnTarget?.focus()
    }
  }, [open, onClose, returnFocusTo])

  if (!open) return null
  const items = NAV_ITEMS.filter((n) => n.mobile === 'more')

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-void/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        className="glass-strong fade-in absolute inset-x-0 bottom-0 rounded-t-[28px] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">More</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-2">
          {items.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-3 rounded-full border px-4 py-3 text-base font-medium ${
                    isActive
                      ? 'border-cyan/60 bg-linear-to-r from-violet/30 to-cyan/20'
                      : 'border-white/10 bg-white/5'
                  }`
                }
              >
                <Icon size={20} aria-hidden="true" className="text-cyan-bright" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
