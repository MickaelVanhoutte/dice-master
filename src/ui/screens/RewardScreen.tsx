import { useRun } from '../../state/runStore'
import { SKILLS_BY_ID } from '../../data/skills'
import { GoldIcon } from '../../assets/AssetRegistry'
import { SkillCard } from '../components/SkillCard'
import { describeSkill } from '../describe'

export function RewardScreen() {
  const reward = useRun((s) => s.reward)
  const run = useRun((s) => s.run)
  const claim = useRun((s) => s.claimReward)
  if (!reward || !run) return null

  const skill = reward.skillId ? SKILLS_BY_ID[reward.skillId] : null

  return (
    <div className="screen reward">
      <h2 className="center victory">Victory!</h2>

      <div className="reward-body">
        <div className="panel loot-card">
          <div className="row loot-gold">
            <GoldIcon className="loot-ic" />
            <span>+{reward.gold + reward.battleGold}</span>
          </div>
          <div className="loot-breakdown dim small">
            <div className="row spread">
              <span>Boss reward</span>
              <span>+{reward.gold}</span>
            </div>
            {reward.battleGold > 0 && (
              <div className="row spread">
                <span>Battle</span>
                <span>+{reward.battleGold}</span>
              </div>
            )}
          </div>
        </div>

        {skill ? (
          <div className="reward-skill">
            <div className="label center">New skill!</div>
            <div className="skill-offer">
              <SkillCard skill={skill} level={0} />
            </div>
            <div className="dim small center offer-desc">{describeSkill(skill, 0)}</div>
            <div className="reward-actions">
              <button className="btn gold" onClick={() => claim(true)}>
                Take
              </button>
              <button className="btn secondary" onClick={() => claim(false)}>
                Leave
              </button>
            </div>
          </div>
        ) : (
          <div className="reward-skill">
            <p className="dim center">No new skill this time.</p>
            <button className="btn gold big" onClick={() => claim(false)}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
