import { RuleEngineStrategy } from '../src/advisor/strategies/rule-engine.strategy';

describe('RuleEngineStrategy.matches', () => {
  const answers = (over: Partial<{ goal: 'HAIR' | 'SKIN'; concern: string; profile: Record<string, string> }> = {}) => ({
    goal: 'HAIR' as const,
    concern: 'hair-fall',
    profile: {},
    ...over,
  });

  it('matches when goal and concern align', () => {
    expect(RuleEngineStrategy.matches({ goal: 'HAIR', concerns: ['hair-fall', 'thinning'] }, answers())).toBe(true);
  });

  it('rejects wrong goal', () => {
    expect(RuleEngineStrategy.matches({ goal: 'SKIN' }, answers())).toBe(false);
  });

  it('rejects unlisted concern', () => {
    expect(RuleEngineStrategy.matches({ goal: 'HAIR', concerns: ['dandruff'] }, answers())).toBe(false);
  });

  it('matches empty conditions (catch-all rule)', () => {
    expect(RuleEngineStrategy.matches({}, answers())).toBe(true);
  });

  it('profile: unanswered questions never disqualify', () => {
    expect(
      RuleEngineStrategy.matches(
        { goal: 'HAIR', profile: { scalpType: ['oily'] } },
        answers({ profile: {} }),
      ),
    ).toBe(true);
  });

  it('profile: answered value must be in allowed list', () => {
    const cond = { goal: 'HAIR' as const, profile: { scalpType: ['oily'] } };
    expect(RuleEngineStrategy.matches(cond, answers({ profile: { scalpType: 'oily' } }))).toBe(true);
    expect(RuleEngineStrategy.matches(cond, answers({ profile: { scalpType: 'dry' } }))).toBe(false);
  });
});
