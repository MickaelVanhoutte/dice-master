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
    <div className="app">
      {screen === 'menu' && <MenuScreen />}
      {screen === 'prep' && <PrepScreen />}
      {screen === 'combat' && <CombatScreen />}
      {screen === 'reward' && <RewardScreen />}
      {screen === 'gameover' && <GameOverScreen />}
      {screen === 'perks' && <PerksScreen />}
      {screen === 'bestiary' && <BestiaryScreen />}
    </div>
  )
}
