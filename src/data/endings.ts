import type { EndingId, GameState } from '../types/game';

// ── Ending metadata (shared by GameOverScreen + PresidentialDispatch) ──

export type EndingTone = 'good' | 'neutral' | 'pyrrhic' | 'loss';

export interface EndingData {
  title: string;
  flavor: string;
  tone: EndingTone;
}

export const ENDINGS: Record<EndingId, EndingData> = {
  new_compact: {
    title: 'The New Compact',
    flavor: "Labor, narrative, and hope... all aligned. Miranda found a third way.",
    tone: 'good',
  },
  a_new_story: {
    title: 'A New Story',
    flavor: "You didn't just survive. You changed the narrative. Miranda writes its own chapter now.",
    tone: 'good',
  },
  republic_endures: {
    title: 'The Republic Endures',
    flavor: "You survived. Miranda survived. Whether those are the same thing is a question for the historians.",
    tone: 'neutral',
  },
  managers_victory: {
    title: "The Manager's Victory",
    flavor: "Efficient. Stable. Soulless. The trains run on time. Nobody sings anymore.",
    tone: 'pyrrhic',
  },
  hollow_republic: {
    title: 'The Hollow Republic',
    flavor: "Miranda is polarized beyond repair. Two countries wearing one flag.",
    tone: 'pyrrhic',
  },
  protectorate: {
    title: 'The Protectorate',
    flavor: "The Colossus didn't invade. It didn't need to. You signed everything over willingly.",
    tone: 'pyrrhic',
  },
  shadow_republic: {
    title: 'The Shadow Republic',
    flavor: "The Underworld runs Miranda now. You're still president. That's the joke.",
    tone: 'pyrrhic',
  },
  impeached: {
    title: 'Impeached',
    flavor: "Your legitimacy hit zero. Congress voted. The margin was... comfortable.",
    tone: 'loss',
  },
  coup: {
    title: 'The Coup',
    flavor: "The Generals moved at dawn. Your last act as president was waking up surrounded.",
    tone: 'loss',
  },
  rival_wins: {
    title: 'The Rival Wins',
    flavor: "They out-organized you, out-narrated you, out-lasted you. Miranda chose someone else.",
    tone: 'loss',
  },
};

export const TONE_ACCENT: Record<EndingTone, string> = {
  good: 'text-green-400',
  neutral: 'text-cyan-400',
  pyrrhic: 'text-amber-400',
  loss: 'text-red-400',
};

export const TONE_BORDER: Record<EndingTone, string> = {
  good: 'border-green-500/40',
  neutral: 'border-cyan-500/40',
  pyrrhic: 'border-amber-500/40',
  loss: 'border-red-500/40',
};

export const TONE_BUTTON_BG: Record<EndingTone, string> = {
  good: 'bg-green-700 hover:bg-green-600 focus:ring-green-500',
  neutral: 'bg-cyan-700 hover:bg-cyan-600 focus:ring-cyan-500',
  pyrrhic: 'bg-amber-700 hover:bg-amber-600 focus:ring-amber-500',
  loss: 'bg-red-700 hover:bg-red-600 focus:ring-red-500',
};

export const TONE_GRADIENT: Record<EndingTone, string> = {
  good: 'from-green-500 via-emerald-400 to-transparent',
  neutral: 'from-cyan-500 via-sky-400 to-transparent',
  pyrrhic: 'from-amber-500 via-yellow-400 to-transparent',
  loss: 'from-red-500 via-rose-400 to-transparent',
};

// ── Presidential Dispatch system ──

export interface DispatchParagraph {
  text: string;
  condition?: (state: GameState) => boolean;
}

export interface PresidentialDispatch {
  paragraphs: DispatchParagraph[];
}

/**
 * Substitutes template variables in dispatch text.
 * Supported variables: {rivalName}, {rivalTitle}, {turn}, {milestonesCount}, {policiesCount}
 */
export function substituteDispatchVars(text: string, state: GameState): string {
  return text
    .replace(/\{rivalName\}/g, state.rival.name)
    .replace(/\{rivalTitle\}/g, state.rival.title)
    .replace(/\{turn\}/g, String(state.turn))
    .replace(/\{milestonesCount\}/g, String(state.achievedMilestoneIds.length))
    .replace(/\{policiesCount\}/g, String(state.policiesEnactedCount));
}

export const PRESIDENTIAL_DISPATCHES: Record<EndingId, PresidentialDispatch> = {
  new_compact: {
    paragraphs: [
      {
        text: "I never believed in miracles. But when the union leaders sat down with the professors, when the factory floor and the lecture hall found a common language... I believed in something stranger. I believed in politics.",
      },
      {
        text: "The Compact will outlast me. It has to. What we built wasn't a compromise. Compromises leave everyone unsatisfied. This was something rarer. An agreement about what matters.",
      },
      {
        text: "{rivalName} conceded gracefully, which surprised everyone, including (I suspect) {rivalName}. The opposition press called it a surrender. We called it a beginning. History will decide who was right.",
      },
      {
        text: "Miranda is still fragile. The Compact is ink on paper until the next generation decides to honor it. But for the first time in a long time, I think they might.",
      },
    ],
  },

  a_new_story: {
    paragraphs: [
      {
        text: "They used to say Miranda's story was already written. A small republic, caught between greater powers, destined to be a footnote. We rewrote it.",
      },
      {
        text: "It wasn't the policies that changed things, not really. It was the narrative. The artists, the journalists, the teachers... they started telling a different story about who Miranda was and who Miranda could be. And people listened.",
      },
      {
        text: "{rivalName}'s talking points stopped landing sometime around month {turn}. Not because they were wrong, exactly. But because they were old. Miranda wanted new words.",
      },
      {
        text: "Stories can be rewritten, of course. The next president will inherit a country that believes in itself, which is a powerful and dangerous thing. I hope they handle it with care.",
      },
    ],
  },

  republic_endures: {
    paragraphs: [
      {
        text: "The desk will pass to someone else. The chair will fit someone else's frame. The pen will sign someone else's name. That is, when you think about it, the whole point.",
      },
      {
        text: "I didn't save Miranda. I kept it going. There's a difference, and the historians can argue about whether it's a meaningful one.",
        condition: (s) => s.resources.narrative <= 50,
      },
      {
        text: "I left them something to work with. The narrative held, the people still believe in this place. That's more than most presidents manage.",
        condition: (s) => s.resources.narrative > 50,
      },
      {
        text: "At least they still talk to each other. In Miranda, that counts as a victory.",
        condition: (s) => s.resources.polarization < 30,
      },
      {
        text: "The polarization worries me. Two Mirandas sharing one capital, one flag, one set of problems they can't agree on. But that's someone else's problem now.",
        condition: (s) => s.resources.polarization >= 30 && s.resources.polarization <= 60,
      },
      {
        text: "My aide kept the scrapbook. {milestonesCount} milestones, each one a small victory that felt enormous at the time. I wonder if the next president will even notice them.",
        condition: (s) => s.achievedMilestoneIds.length > 3,
      },
      {
        text: "Four years. {turn} months of it, anyway. The view from this window doesn't change, but somehow the country outside it does. Good luck to whoever sits here next.",
      },
    ],
  },

  managers_victory: {
    paragraphs: [
      {
        text: "The numbers are excellent. GDP growth, employment metrics, budget surplus, trade efficiency. Every chart trends upward. Every indicator is green. The technocrats are pleased.",
      },
      {
        text: "The unions are quiet. Not content. Quiet. There's a difference that the economic reports don't capture. Labor cohesion fell below what anyone thought possible, and the factories kept running. That should worry someone.",
      },
      {
        text: "I built a machine. An effective, humming, well-oiled machine that processes inputs and produces outputs and never once asks why. The opposition vanished not because they were wrong but because they became irrelevant.",
      },
      {
        text: "Nobody sings the old songs anymore. Nobody argues in the cafes. Miranda works. And on the quiet nights, when the efficiency reports are filed and the lights go out in the ministry buildings, I wonder if that's enough.",
      },
    ],
  },

  hollow_republic: {
    paragraphs: [
      {
        text: "There are two Mirandas now. Everyone knows it. Nobody says it in polite company, but the maps tell the story. Different newspapers, different facts, different countries sharing one unfortunate flag.",
      },
      {
        text: "The center didn't hold. I'm not sure there ever was a center, not really. Just a polite fiction we maintained for as long as the math allowed.",
      },
      {
        text: "Democracy continues, technically. Elections happen. Votes are counted. But the losing side doesn't accept the result, and the winning side doesn't expect them to. It's performance, all the way down.",
      },
      {
        text: "I'll be remembered differently depending on which Miranda you ask. One of them will call me a hero. The other will call me the reason. They're both half right, which is the most Miranda thing I can imagine.",
      },
    ],
  },

  protectorate: {
    paragraphs: [
      {
        text: "The ambassador smiles a lot. He smiled when the advisory agreement was signed. He smiled when the security cooperation treaty was ratified. He smiled when our central bank adopted their monetary framework.",
      },
      {
        text: "Sovereignty is a funny word. It appears in all our documents, on our letterhead, in our constitution. The Colossus never asked us to remove it. They didn't need to. The word means something different now.",
      },
      {
        text: "Miranda is safe. Prosperous, even. The trade deals are favorable (for someone). The military advisors are helpful (to someone). We have independence the way a child has independence at the dinner table.",
      },
      {
        text: "I signed everything willingly. That's what they'll write, and it will be true. Nobody held a gun to my head. They just made sure every other option was worse. Diplomacy, they call it.",
      },
    ],
  },

  shadow_republic: {
    paragraphs: [
      {
        text: "I am still president. I sign papers. I give speeches. I attend state functions and shake hands with foreign dignitaries. The Syndicate finds this arrangement convenient.",
      },
      {
        text: "The Underworld doesn't govern openly. That would be crude. Instead, every decision routes through their network, every contract finds its way to the right hands, every inconvenient investigation loses its funding.",
      },
      {
        text: "Everyone prospers. That's the remarkable thing. The economy grows, the streets are clean, the trains run. Nobody asks how. Nobody asks why the police chief's nephew owns three shipping companies. Questions are impolite.",
      },
      {
        text: "I keep a list in my desk drawer of the things I chose not to see. It gets longer every month. Miranda functions. That's the word I use. Functions. In my more honest moments, I wonder what the word costs.",
      },
    ],
  },

  impeached: {
    paragraphs: [
      {
        text: "You barely unpacked. The desk drawers still had the previous administration's paperclips when Congress called the vote. If there's a speed record for losing the confidence of the legislature, you're a contender.",
        condition: (s) => s.turn <= 12,
      },
      {
        text: "Congress voted. The margin was comfortable, which is the polite way of saying it wasn't close. The aides cleared the office with a speed that suggested they'd been practicing.",
        condition: (s) => s.turn > 12 && s.turn < 40,
      },
      {
        text: "So close to the end. {turn} months in, and the finish line was almost visible. But legitimacy is not a thing you can borrow against, and the bill came due with interest.",
        condition: (s) => s.turn >= 40,
      },
      {
        text: "The hallways emptied fast. Not hostile, just... efficient. People who smiled last week now look through you. That's the thing about power. You only notice the warmth when it stops.",
      },
      {
        text: "Your successor's portrait was hung before lunch. The painter must have been working for weeks, which tells you everything about how surprised Congress really was. Miranda moves on. It always does.",
      },
    ],
  },

  coup: {
    paragraphs: [
      {
        text: "Dawn. That particular gray light that comes before the sun has decided whether the day is worth it. Boots on marble. Someone is shouting orders in a voice trained to be obeyed.",
      },
      {
        text: "The radio went silent first. Then the broadcast, clipped and professional. \"Temporary measures to restore order.\" Miranda has heard those words before. They never mean temporary. They never restore order.",
      },
      {
        text: "The generals moved because they could. Because military loyalty had eroded past the point where anyone in uniform felt obliged to defend a civilian government. That's not a coup. That's gravity.",
      },
      {
        text: "Someone will write the history. They'll say the conditions were impossible, that no president could have held it together. Maybe they're right. But that's a cold comfort when the boots are in the hallway.",
      },
    ],
  },

  rival_wins: {
    paragraphs: [
      {
        text: "{rivalName}'s victory speech played on every channel. Confident, measured, already presidential. The transition team was ready before the results were certified. They'd been planning this for a while.",
      },
      {
        text: "The policies were reversed within a week. Not all of them. Just enough to make a point. {policiesCount} decisions, months of negotiations, careful compromises... undone with a signature and a press conference.",
      },
      {
        text: "Strangers cleared the desk. Your desk, for {turn} months anyway. They were polite about it, which somehow made it worse. A cardboard box and a handshake. That's how it ends.",
      },
      {
        text: "Miranda chose someone else. That's democracy, the part they don't put on the inspirational posters. Sometimes the people decide you're not the answer. And you have to live with that, which is harder than it sounds.",
      },
    ],
  },
};
