import { useState } from 'react'
import type { AssessmentResult, AssessmentType, Baseline, GameResult } from '../../types'
import { AttentionTest } from '../games/AttentionTest'
import { MemoryTest } from '../games/MemoryTest'
import { ReactionTest } from '../games/ReactionTest'
import { ResultPanel } from '../games/ResultPanel'
import { Countdown } from './Countdown'
import { Instructions } from './Instructions'
import { MissionStage, type StagePhase } from './MissionStage'
import { missionFor } from './missions'

/** State machine for one run: instructions -> countdown -> playing -> result. Mount with key={runKey}. */
export function TestStage({
  type,
  startAt = 'instructions',
  outcome,
  baseline,
  onComplete,
  onAbort,
  onRetry,
}: {
  type: AssessmentType
  /** Retries skip straight to the countdown. */
  startAt?: 'instructions' | 'countdown'
  outcome: { result: AssessmentResult; previous?: AssessmentResult } | null
  baseline: Baseline
  onComplete: (g: GameResult) => void
  onAbort: () => void
  onRetry: () => void
}) {
  const [step, setStep] = useState<'instructions' | 'countdown' | 'playing'>(startAt)
  const phase: StagePhase = outcome ? 'result' : step
  const m = missionFor(type)

  return (
    <MissionStage label={`${m.title}: mission ${m.mission}`} phase={phase} onAbort={onAbort}>
      {phase === 'instructions' && (
        <Instructions type={type} onBegin={() => setStep('countdown')} onBack={onAbort} />
      )}
      {phase === 'countdown' && <Countdown onDone={() => setStep('playing')} />}
      {phase === 'playing' && (
        <>
          {type === 'reaction' && <ReactionTest autoStart onComplete={onComplete} onCancel={onAbort} />}
          {type === 'memory' && <MemoryTest autoStart onComplete={onComplete} onCancel={onAbort} />}
          {type === 'attention' && <AttentionTest autoStart onComplete={onComplete} onCancel={onAbort} />}
        </>
      )}
      {outcome && (
        <ResultPanel
          result={outcome.result}
          previous={outcome.previous}
          baseline={baseline}
          onRetry={onRetry}
          onBack={onAbort}
        />
      )}
    </MissionStage>
  )
}
