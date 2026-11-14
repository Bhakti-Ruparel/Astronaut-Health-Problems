import { Starfield } from '../art/Starfield'

export function SpaceBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Starfield className="absolute inset-0 h-full w-full opacity-70" />
      <div
        className="absolute -top-40 -right-40 h-[38rem] w-[38rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(139 92 246 / 0.22), transparent 65%)' }}
      />
      <div
        className="absolute -bottom-52 -left-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgb(85 198 232 / 0.14), transparent 65%)' }}
      />
    </div>
  )
}
