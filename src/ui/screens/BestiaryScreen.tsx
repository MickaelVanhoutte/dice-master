import { useState } from 'react'
import { useMeta } from '../../state/metaStore'
import { useRun } from '../../state/runStore'
import { SKILLS } from '../../data/skills'
import { MONSTERS } from '../../data/monsters'
import { CHARACTERS } from '../../data/characters'
import { CharacterArt, MonsterArt, SkillIcon } from '../../assets/AssetRegistry'
import { roleColor } from '../components/SkillBar'
import { describeSkill } from '../describe'

type Tab = 'skills' | 'monsters' | 'heroes'

export function BestiaryScreen() {
  const meta = useMeta()
  const goTo = useRun((s) => s.goTo)
  const [tab, setTab] = useState<Tab>('skills')

  const seenSkills = new Set(meta.seenSkills)
  const seenMonsters = new Set(meta.seenMonsters)
  const seenChars = new Set(meta.seenCharacters)

  return (
    <div className="screen bestiary">
      <div className="row spread">
        <h2>Bestiary</h2>
        <button className="btn secondary" onClick={() => goTo('menu')}>
          Back
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'skills' ? 'on' : ''}`} onClick={() => setTab('skills')}>
          Skills {seenSkills.size}/{SKILLS.length}
        </button>
        <button className={`tab ${tab === 'monsters' ? 'on' : ''}`} onClick={() => setTab('monsters')}>
          Foes {seenMonsters.size}/{MONSTERS.length}
        </button>
        <button className={`tab ${tab === 'heroes' ? 'on' : ''}`} onClick={() => setTab('heroes')}>
          Heroes {seenChars.size}/{CHARACTERS.length}
        </button>
      </div>

      {tab === 'skills' && (
        <div className="bestiary-list">
          {SKILLS.map((s) => {
            const seen = seenSkills.has(s.id)
            return (
              <div key={s.id} className={`panel bestiary-card ${seen ? '' : 'locked'}`}>
                <span style={{ color: seen ? roleColor(s.art) : 'var(--line)' }}>
                  <SkillIcon art={s.art} className="bestiary-ic" />
                </span>
                <div className="bestiary-text">
                  <div className="row spread">
                    <strong>{seen ? s.name : '???'}</strong>
                    <span className={`rarity ${s.rarity}`}>{s.rarity}</span>
                  </div>
                  <div className="dim small">{seen ? describeSkill(s, 0) : 'Undiscovered'}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'monsters' && (
        <div className="bestiary-list">
          {MONSTERS.map((m) => {
            const seen = seenMonsters.has(m.id)
            return (
              <div key={m.id} className={`panel bestiary-card ${seen ? '' : 'locked'}`}>
                <div className="bestiary-mon">{seen ? <MonsterArt id={m.id} className="bestiary-monart" /> : <span className="q">?</span>}</div>
                <div className="bestiary-text">
                  <strong>{seen ? m.name : '???'}</strong>
                  <div className="dim small">
                    {seen ? (m.passive.kind === 'none' ? 'No passive' : m.passive.label) : 'Undiscovered'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'heroes' && (
        <div className="bestiary-list">
          {CHARACTERS.map((c) => {
            const seen = seenChars.has(c.id)
            return (
              <div key={c.id} className={`panel bestiary-card ${seen ? '' : 'locked'}`}>
                <div className="bestiary-mon">{seen ? <CharacterArt id={c.id} className="bestiary-monart" /> : <span className="q">?</span>}</div>
                <div className="bestiary-text">
                  <strong>{seen ? c.name : '???'}</strong>
                  <div className="dim small">{seen ? c.desc : 'Play as this hero to unlock.'}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
