import { BuddyProfile } from './storage';

export type BuddyStats = {
  days: number;
  streak: number;
  level: number;
  coins: number;
  cravingCount: number;
  beatenCount: number;
};

const REASON_LINES: Record<string, string> = {
  health: 'your lungs and body are repairing themselves every single day',
  money: 'every day clean is money back in your pocket',
  mind: 'your clarity and memory sharpen with every clean week',
  family: 'the people you love are getting more of the real you',
  freedom: 'you are proving you control your life, not a substance',
};

const TRIGGER_TIPS: Record<string, string> = {
  stress: 'When stress hits, try the Panic Button breathing — 3 cycles lower cortisol fast. A 5-minute walk works too.',
  boredom: 'Boredom cravings fade in ~10 minutes. Queue up something with your hands: a game, drawing, even dishes. Log it and watch it pass.',
  sleep: 'Sleep cravings mean your brain is relearning natural rest. No screens 30 min before bed, and remember: week 2-3 is when sleep normalizes.',
  social: 'Social cravings are the sneakiest. Have a drink in hand (soda counts), be the one who suggests the next activity, and text me after — I want to hear how it went.',
  habit: 'Habit cravings are just routines. Swap the ritual: same time, same place, different action. Tea, gum, a walk around the block.',
};

function name(p: BuddyProfile | null): string {
  return p?.userName ? `, ${p.userName}` : '';
}

export function buddyGreeting(p: BuddyProfile | null, s: BuddyStats): string {
  const dayLine =
    s.days === 0
      ? 'Day one. The hardest and bravest day. I am right here with you.'
      : s.days < 7
      ? `${s.days} days clean — you are through the worst of the fog. Keep going.`
      : s.days < 30
      ? `${s.days} days! Your brain chemistry is visibly rebalancing right now.`
      : `${s.days} days. You are not "trying to quit" anymore — you quit.`;
  const reason = p ? ` Remember why you started: ${REASON_LINES[p.quitReason] ?? 'your future self is counting on you'}.` : '';
  return `Hey${name(p)}! ${dayLine}${reason}`;
}

export function buddyReply(input: string, p: BuddyProfile | null, s: BuddyStats): string {
  const t = input.toLowerCase();

  if (/(crav|want to smoke|urge|tempt)/.test(t)) {
    const tip = p ? TRIGGER_TIPS[p.mainTrigger] : undefined;
    return (
      `That craving feels huge right now, but it is a wave — it peaks and passes in about 10 minutes. ` +
      `You have beaten ${s.beatenCount} of these already. Hit the Panic tab and breathe with the bubble.` +
      (tip ? `\n\n${tip}` : '')
    );
  }
  if (/(slip|relapse|failed|smoked|gave in)/.test(t)) {
    return (
      `Hey. A slip is data, not defeat. You still have ${s.days} days of healing behind you — that does not reset to zero in your body. ` +
      `Log it in the Log tab so we can spot the pattern, and let's make tomorrow green on your heatmap.${name(p)}, I am not going anywhere.`
    );
  }
  if (/(sad|depress|down|empty)/.test(t)) {
    return (
      `That flat, grey feeling is super common in early recovery — your dopamine system is recalibrating. It is temporary, and it means healing is happening. ` +
      `Small wins today: check in, drink water, 10 minutes of sunlight. And tell me about it tomorrow, okay?`
    );
  }
  if (/(sleep|tired|insomnia|cant sleep)/.test(t)) {
    return TRIGGER_TIPS.sleep;
  }
  if (/(stress|anxious|anxiety|overwhelm)/.test(t)) {
    return TRIGGER_TIPS.stress;
  }
  if (/(bored|boring|nothing to do)/.test(t)) {
    return TRIGGER_TIPS.boredom;
  }
  if (/(money|spend|cost|afford)/.test(t)) {
    return `Every clean day is money you keep. Check your Home screen — that savings counter is real. Want a stretch goal? Pick something you have wanted for ages and let your clean days pay for it.`;
  }
  if (/(friend|party|social|people)/.test(t)) {
    return TRIGGER_TIPS.social;
  }
  if (/(goal|progress|how am i doing|doing)/.test(t)) {
    const goalLine =
      p && p.goalDays > 0
        ? ` You are ${Math.min(100, Math.round((s.days / p.goalDays) * 100))}% of the way to your ${p.goalDays}-day goal.`
        : '';
    return `Here is your report card${name(p)}: ${s.days} days clean, ${s.streak}-day check-in streak, level ${s.level}, ${s.beatenCount} cravings beaten.${goalLine} Honestly? You are doing better than you think.`;
  }
  if (/(thank|thanks)/.test(t)) {
    return `Always${name(p)}. This is a team effort — you do the hard part, I just keep score. 💚`;
  }
  if (/(help|what can you do)/.test(t)) {
    return (
      `I am your quit buddy. I know your streaks, your cravings, and why you are doing this. You can tell me:\n` +
      `· "I'm craving" — instant coping plan\n` +
      `· "I slipped" — zero-judgment recovery\n` +
      `· "How am I doing?" — your progress report\n` +
      `· "I'm stressed / bored / can't sleep" — tailored tips for your triggers`
    );
  }

  const reason = p ? REASON_LINES[p.quitReason] : undefined;
  return (
    `I hear you${name(p)}. Whatever today looks like, the counter is still running and that means you are still winning.` +
    (reason ? ` And for the record: ${reason}.` : '') +
    ` Want a progress report? Just ask "how am I doing?"`
  );
}
