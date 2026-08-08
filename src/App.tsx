import { useRun } from './state/runStore'
import { MenuScreen } from './ui/screens/MenuScreen'
import { PrepScreen } from './ui/screens/PrepScreen'
import { CombatScreen } from './ui/screens/CombatScreen'
import { RewardScreen } from './ui/screens/RewardScreen'
import { GameOverScreen } from './ui/screens/GameOverScreen'
import { PerksScreen } from './ui/screens/PerksScreen'
import { BestiaryScreen } from './ui/screens/BestiaryScreen'

export default function App() {
  const screen = useRun((s) => s.screen)

  return (
    <>
      <div className="rotate-gate">
        <svg className="rot-icon" viewBox="0 0 24 24" aria-hidden>
          <rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 14 a8 8 0 0 0 8 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2.5 12.5 L4 14 L5.5 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>Rotate your device</h2>
        <p className="dim">Dice Masters plays in landscape.</p>
      </div>
      <div className="app">
        {screen === 'menu' && <MenuScreen />}
      {screen === 'prep' && <PrepScreen />}
      {screen === 'combat' && <CombatScreen />}
      {screen === 'reward' && <RewardScreen />}
      {screen === 'gameover' && <GameOverScreen />}
        {screen === 'perks' && <PerksScreen />}
        {screen === 'bestiary' && <BestiaryScreen />}
      </div>
    </>
  )
}
