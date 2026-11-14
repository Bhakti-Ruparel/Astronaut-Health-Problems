import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { DISCLAIMER } from '../../data/constants'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-navy">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-orange focus:px-3 focus:py-2 focus:text-navy"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="border-t border-white/10 px-6 py-4 text-center font-mono text-[11px] text-muted">
          {DISCLAIMER}
        </footer>
      </div>
    </div>
  )
}
