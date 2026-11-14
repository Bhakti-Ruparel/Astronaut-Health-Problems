import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { DISCLAIMER } from '../../data/constants'
import { CardSkeleton } from '../ui/Skeleton'
import { BottomTabs } from './BottomTabs'
import { Sidebar } from './Sidebar'
import { SpaceBackground } from './SpaceBackground'
import { TopBar } from './TopBar'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen md:pt-0">
      <SpaceBackground />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-cyan-bright focus:px-4 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          id="main"
          className="mx-auto w-full max-w-7xl flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-8"
        >
          <Suspense fallback={<CardSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="px-6 pt-2 pb-[calc(6rem+env(safe-area-inset-bottom))] text-center text-[11px] text-muted md:pb-6">
          {DISCLAIMER}
        </footer>
      </div>
      <BottomTabs />
    </div>
  )
}
