import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Starfield } from '../art/Starfield'
import './assessment.css'

const Planet = lazy(() => import('../art/Planet').then((m) => ({ default: m.Planet })))

export type StagePhase = 'instructions' | 'countdown' | 'playing' | 'result'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Full-screen immersive dialog that hosts a mission (instructions, countdown, game, result). */
export function MissionStage({
  label,
  phase,
  onAbort,
  children,
}: {
  label: string
  phase: StagePhase
  onAbort: () => void
  children: ReactNode
}) {
  const dialog = useRef<HTMLDivElement>(null)
  const [confirming, setConfirming] = useState(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const confirmingRef = useRef(false)
  confirmingRef.current = confirming
  const abortRef = useRef(onAbort)
  abortRef.current = onAbort

  // Lock page scroll, make the app shell inert and restore focus to the opener.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const prevOverflow = document.body.style.overflow
    const root = document.getElementById('root')
    document.body.style.overflow = 'hidden'
    root?.setAttribute('inert', '')
    root?.setAttribute('aria-hidden', 'true')
    if (!dialog.current?.contains(document.activeElement)) dialog.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      root?.removeAttribute('inert')
      root?.removeAttribute('aria-hidden')
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [])

  // Leaving the playing phase closes any open confirmation.
  useEffect(() => {
    if (phase !== 'playing') setConfirming(false)
  }, [phase])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (phaseRef.current === 'playing') setConfirming((c) => !c)
        else abortRef.current()
        return
      }
      if (e.key === 'Tab' && dialog.current) {
        const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        )
        if (items.length === 0) {
          e.preventDefault()
          dialog.current.focus()
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === dialog.current)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        } else if (!dialog.current.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto bg-void outline-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(900px 600px at 80% 0%, rgb(139 92 246 / .28), transparent 60%), radial-gradient(800px 600px at 0% 100%, rgb(85 198 232 / .16), transparent 60%), linear-gradient(180deg, #0b1430 0%, #1a1b5e 60%, #070d1f 100%)',
        }}
      >
        <Starfield className="absolute inset-0 h-full w-full opacity-80" />
        <Suspense fallback={null}>
          <Planet variant="nebula" animate className="absolute -right-24 -bottom-24 w-[28rem] max-w-[80vw] opacity-40" />
        </Suspense>
        <div className="mission-vignette absolute inset-0" />
      </div>

      <div className="stage-in relative mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 py-8 md:py-12">
        {children}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-void/60 p-4">
          <div role="alertdialog" aria-modal="true" aria-label="Abort mission?" className="glass-strong max-w-sm p-6 text-center">
            <h2 className="font-display text-lg font-semibold text-white">Abort this mission?</h2>
            <p className="mt-1 text-sm text-muted">Your progress will not be saved.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => setConfirming(false)} autoFocus>
                Keep playing
              </button>
              <button type="button" className="btn btn-warn" onClick={() => abortRef.current()}>
                Abort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
