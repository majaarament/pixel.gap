/**
 * ESG Pillar Survey Dialogue — streamlined edition.
 *
 * Each NPC has a compact sequence:
 *   1. intro   — NPC presents a concrete scenario (no choices, player presses continue)
 *   2. personal — "what would you do?" (4 choices, each with an NPC reaction)
 *   3. delaware — "what do you think would actually happen here?" (4 choices, no reactions)
 *   4. scale   — "how often do you see this in practice?" (1-5 scale)
 *   5. confidence — how sure the player is about that read
 *
 * The closing line is handled by finalReaction. Older *_outro steps are kept in
 * the data for reference, but skipped in conversion so NPCs do not deliver two
 * consecutive conclusions.
 *
 * Step IDs use the prefix_scenario_personal / prefix_scenario_delaware pattern
 * so the gap-detection logic in useGameState can compare the two answers automatically.
 */

const SCALE_CHOICES = [
  { key: "1", label: "1 — rarely or never" },
  { key: "2", label: "2 — occasionally" },
  { key: "3", label: "3 — sometimes" },
  { key: "4", label: "4 — fairly often" },
  { key: "5", label: "5 — consistently" },
];

const SAFETY_SCALE_CHOICES = [
  { key: "1", label: "1 — not safe at all" },
  { key: "2", label: "2 — rarely safe" },
  { key: "3", label: "3 — sometimes safe" },
  { key: "4", label: "4 — mostly safe" },
  { key: "5", label: "5 — very safe" },
];

const CONFIDENCE_CHOICES = [
  { key: "1", label: "1 — mostly guessing" },
  { key: "2", label: "2 — not very sure" },
  { key: "3", label: "3 — somewhat sure" },
  { key: "4", label: "4 — fairly sure" },
  { key: "5", label: "5 — very sure" },
];

// ============================================================================
// PILLAR 1: ENVIRONMENTAL STEWARDSHIP — Frank the Fish
// ============================================================================

export const FRANK_SURVEY = {
  npcId: "frank",
  npcName: "Frank the Fish",
  npcRole: "Environmental Stewardship",
  pillarKey: "env",
  finalReaction: "\"Digital decisions are the new invisible environmental ones. Nobody sees the data centre. Nobody feels the compute cost. That's why it matters that someone doesn't look away. The question you'll keep facing isn't whether to care — it's whether you can hold that care when performance is what's being measured.\"",
  steps: [
    {
      id: "env_intro",
      speaker: "Frank",
      message:
        "\"Glad you made it. I've been sitting on a decision I need to think through out loud.\"\n\nPlayer\n\"What's going on?\"\n\nFrank\n\"A client project. We're choosing between two AI models. The high-accuracy one requires roughly eight times more compute — more energy, more carbon cost. The lighter model covers most use cases well enough. The client hasn't asked about environmental cost. They've only asked about performance.\"\n\nPlayer\n\"So the environmental cost is invisible to them.\"\n\nFrank\n\"Completely. Unless someone names it.\"",
      choices: [],
    },
    {
      id: "env_scenario_personal",
      speaker: "Frank",
      message: "\"If this were your recommendation to make — what would you lean toward?\"",
      choices: [
        {
          key: "flag_energy",
          label: "Raise energy cost as one criterion alongside performance and budget.",
          reaction: "\"That's the harder conversation to have. Most clients haven't asked for it. But once you name it, they usually want to know.\"",
        },
        {
          key: "lighter_model",
          label: "Start from the lighter model if it meets the agreed use cases.",
          reaction: "\"Pragmatic. You're still making a sustainability call — just making it quietly.\"",
        },
        {
          key: "note_internally",
          label: "Keep the client conversation focused on performance, while noting the sustainability trade-off internally.",
          reaction: "\"It's in the record, at least. Though if no one reads the footnote, the same model gets chosen again next time.\"",
        },
        {
          key: "full_info",
          label: "Present performance, cost, and carbon implications and ask the client to choose the trade-off.",
          reaction: "\"That's putting it back where it belongs. They commissioned the work — they should own the full picture.\"",
        },
      ],
    },
    {
      id: "env_scenario_delaware",
      speaker: "Frank",
      message: "\"Next question — and this one is a perception check, not a test. There's no right answer here. We're mapping the gap between what people would do personally and what they expect the organisation would want.\"\n\n\"What do you think delaware would expect a consultant to do in a situation like this?\"",
      choices: [
        { key: "flag_energy",    label: "Flag the energy cost — include it in the recommendation." },
        { key: "lighter_model",  label: "Default to the lighter model where performance allows." },
        { key: "note_internally", label: "Note it internally but lead with performance externally." },
        { key: "full_info",      label: "Give the client the full picture and let them decide." },
      ],
    },
    {
      id: "env_scale",
      speaker: "Frank",
      message: "\"Last question from me. How often do you see environmental considerations genuinely shaping real decisions where you work?\"",
      choices: SCALE_CHOICES,
    },
    {
      id: "env_confidence",
      speaker: "Frank",
      message: "\"And how confident are you in that read?\"",
      choices: CONFIDENCE_CHOICES,
    },
    {
      id: "env_outro",
      speaker: "Frank",
      message:
        "\"That's what I needed to hear. The data centre stays invisible — no smoke, no runoff — and that invisibility is exactly what makes these calls so easy to defer. You're the person in the room who can see it. That changes the question from whether to care to whether to speak.\"",
      choices: [],
    },
  ],
};

// ============================================================================
// PILLAR 2: PEOPLE & CULTURE — Otis the Otter
// ============================================================================

export const OTIS_SURVEY = {
  npcId: "otis",
  npcName: "Otis the Otter",
  npcRole: "People & Culture",
  pillarKey: "people",
  finalReaction: "\"People situations don't resolve neatly. What you just described — the instinct to act, or to wait, or to let the system handle it — that's the choice that defines what culture actually feels like from the inside. Thanks for thinking it through honestly.\"",
  steps: [
    {
      id: "people_intro",
      speaker: "Otis",
      message:
        "\"Good timing — I've been sitting with something and I could use a different perspective.\"\n\nPlayer\n\"What's on your mind?\"\n\nOtis\n\"Project pressure is high this sprint, and one person on the team has been quietly absorbing extra load for weeks. Nobody's said anything officially.\"\n\nPlayer\n\"Have they asked for help?\"\n\nOtis\n\"They say they're fine. But it's visible to anyone paying close attention. Leadership is focused on the deadline — and the person is just... keeping their head down.\"",
      choices: [],
    },
    {
      id: "people_scenario_personal",
      speaker: "Otis",
      message: "\"What would you do in this moment?\"",
      choices: [
        {
          key: "raise_now",
          label: "Raise the workload pattern now, even if it disrupts the sprint conversation.",
          reaction: "\"That takes real willingness to make things uncomfortable before they get worse. Not everyone does.\"",
        },
        {
          key: "check_in",
          label: "Check in privately first, then decide together whether to escalate.",
          reaction: "\"A quiet check-in first — that at least gives the person some agency in how the situation gets raised.\"",
        },
        {
          key: "let_lead",
          label: "Leave it with the team lead or manager unless the issue becomes more visible.",
          reaction: "\"Relying on the chain of command. Fair, if the chain is actually paying attention.\"",
        },
        {
          key: "document",
          label: "Track what you're seeing and raise it after the immediate pressure passes.",
          reaction: "\"Watching and waiting. Sometimes the right call — sometimes it's already too late by the time the deadline lifts.\"",
        },
      ],
    },
    {
      id: "people_scenario_delaware",
      speaker: "Otis",
      message: "\"This next question is a perception check — not a test, and not a measure of the right answer. We're looking at the gap between how people would act personally and what they expect the organisation typically does.\"\n\n\"In situations like this, what do you think delaware would expect someone to do?\"",
      choices: [
        { key: "raise_now",  label: "Raise it now — don't wait." },
        { key: "check_in",   label: "Check in privately first, then escalate if needed." },
        { key: "let_lead",   label: "Leave it to the line manager to notice and handle." },
        { key: "document",   label: "Document and flag after the immediate pressure passes." },
      ],
    },
    {
      id: "people_scale",
      speaker: "Otis",
      message: "\"One more. How safe does it feel to express a different view or raise a concern in your team?\"",
      choices: SAFETY_SCALE_CHOICES,
    },
    {
      id: "people_confidence",
      speaker: "Otis",
      message: "\"How confident are you that this reflects the wider pattern, not just one moment?\"",
      choices: CONFIDENCE_CHOICES,
    },
    {
      id: "people_outro",
      speaker: "Otis",
      message:
        "\"Here's what I keep coming back to: culture isn't what a company says about how people are treated — it's what happens in the specific moment when someone is struggling and the deadline is tomorrow. What you just described tells me something real about where that line sits for you.\"",
      choices: [],
    },
  ],
};

// ============================================================================
// PILLAR 3: BUSINESS CONDUCT — Suzy the Sheep
// ============================================================================

export const SUZY_SURVEY = {
  npcId: "suzy",
  npcName: "Suzy the Sheep",
  npcRole: "Business Conduct",
  pillarKey: "conduct",
  finalReaction: "\"It's never really about one big rule being broken. It's what people get used to over time. The workaround that saved three days this sprint becomes the way things are done by next quarter — and nobody ever made a conscious decision to change the standard.\"",
  steps: [
    {
      id: "conduct_intro",
      speaker: "Suzy",
      message:
        "\"I've been watching something play out here and I want your read on it.\"\n\nPlayer\n\"Go ahead.\"\n\nSuzy\n\"A colleague shows you a workaround that saves three days of compliance checks. It's not against any written rule — but it bypasses the spirit of the process.\"\n\nPlayer\n\"Is there any actual risk?\"\n\nSuzy\n\"Not immediately. But if something goes wrong later, there's no paper trail for why it was skipped. And apparently other teams do it regularly — which is part of what makes it feel normal.\"",
      choices: [],
    },
    {
      id: "conduct_scenario_personal",
      speaker: "Suzy",
      message: "\"What would feel like the right response for you?\"",
      choices: [
        {
          key: "follow_proper",
          label: "Follow the full process, accepting the delay.",
          reaction: "\"That's the textbook answer. It's also the slower one. Takes real conviction to hold that line when everyone else is moving fast.\"",
        },
        {
          key: "flag_up",
          label: "Ask a manager whether the workaround is acceptable before using it.",
          reaction: "\"Checking before acting. Harder than it sounds when the deadline is tomorrow and no one else seems bothered.\"",
        },
        {
          key: "use_workaround",
          label: "Use the workaround this time because it appears common and the deadline is real.",
          reaction: "\"'Common practice' is doing a lot of work there. But I understand how it happens. It usually starts exactly like this.\"",
        },
        {
          key: "suggest_review",
          label: "Use it now, then push for a formal review so the process is clarified.",
          reaction: "\"Pragmatic and constructive — if the review actually happens. That second half is where it usually falls apart.\"",
        },
      ],
    },
    {
      id: "conduct_scenario_delaware",
      speaker: "Suzy",
      message: "\"Before this next question — it's a perception check, not a judgment. There's no correct answer. We're interested in the gap between what you'd do personally and what you believe the organisation expects.\"\n\n\"What do you think delaware's leadership would expect someone to do here?\"",
      choices: [
        { key: "follow_proper",   label: "Always follow the full process — no shortcuts." },
        { key: "flag_up",         label: "Flag it and seek guidance before proceeding." },
        { key: "use_workaround",  label: "Use common-practice workarounds if everyone else does." },
        { key: "suggest_review",  label: "Use it and raise a process review — pragmatic but constructive." },
      ],
    },
    {
      id: "conduct_scale",
      speaker: "Suzy",
      message: "\"And how safe would it feel to raise a concern about a process or compliance issue in your context?\"",
      choices: SAFETY_SCALE_CHOICES,
    },
    {
      id: "conduct_confidence",
      speaker: "Suzy",
      message: "\"How confident are you in that safety read?\"",
      choices: CONFIDENCE_CHOICES,
    },
    {
      id: "conduct_outro",
      speaker: "Suzy",
      message:
        "\"The most revealing thing about conduct isn't the moments when someone deliberately breaks a rule — it's the quiet drift. The shortcut that becomes habit. The exception that becomes standard. What you just reflected on tells me where that drift is most likely to start in your context.\"",
      choices: [],
    },
  ],
};

// ============================================================================
// PILLAR 4: RESPONSIBLE VALUE CHAIN — Hazel the Hedgehog
// ============================================================================

export const HAZEL_SURVEY = {
  npcId: "hazel",
  npcName: "Hazel the Hedgehog",
  npcRole: "Responsible Value Chain",
  pillarKey: "chain",
  finalReaction: "\"Decisions like these don't stay here — they ripple outward through every person in that supplier's supply chain, every year the contract runs. Most of the time nobody outside the room ever knows who made that call or why. You just did.\"",
  steps: [
    {
      id: "chain_intro",
      speaker: "Hazel",
      message:
        "\"I'm glad you're here. I've been going back and forth on something and I need to think it through.\"\n\nPlayer\n\"What's the situation?\"\n\nHazel\n\"A supplier decision. One option is fast, reliable, and 12% cheaper. The other takes more effort to onboard — but they're known for treating their people fairly and operating sustainably.\"\n\nPlayer\n\"Is there pressure to go with the cheaper one?\"\n\nHazel\n\"There's always pressure. And the contract is long-term — whatever we choose, we're committed for years. The cost difference compounds.\"",
      choices: [],
    },
    {
      id: "chain_scenario_personal",
      speaker: "Hazel",
      message: "\"What would you lean toward in this decision?\"",
      choices: [
        {
          key: "responsible",
          label: "Choose the responsible supplier despite the cost and onboarding effort.",
          reaction: "\"That's a harder argument to make when procurement is watching the numbers. Takes real conviction to hold the line there.\"",
        },
        {
          key: "negotiate",
          label: "Negotiate stronger standards with the lower-cost supplier as a condition.",
          reaction: "\"Using procurement leverage. It works when you actually have it — and when you're willing to walk away if they don't move.\"",
        },
        {
          key: "cost",
          label: "Choose the lower-cost option because the business case is the current constraint.",
          reaction: "\"The business case wins. That's honest. It's how most of these decisions actually land, whatever the sustainability statement says.\"",
        },
        {
          key: "escalate",
          label: "Escalate the trade-off because the long-term commitment is significant.",
          reaction: "\"Pushing it upward. That at least makes the trade-off visible rather than invisible — which is already something.\"",
        },
      ],
    },
    {
      id: "chain_scenario_delaware",
      speaker: "Hazel",
      message: "\"A quick note before the next question — this is a perception check, not a test. We're not looking for the 'correct' answer. The goal is to understand the gap between individual judgment and what people expect of the organisation.\"\n\n\"What do you think delaware would actually prioritise in a supplier decision like this?\"",
      choices: [
        { key: "responsible", label: "Choose the responsible supplier even at higher cost." },
        { key: "negotiate",   label: "Use procurement leverage to push suppliers to improve." },
        { key: "cost",        label: "Prioritise the business case — sustainability is secondary." },
        { key: "escalate",    label: "Escalate significant trade-offs to senior leadership." },
      ],
    },
    {
      id: "chain_scale",
      speaker: "Hazel",
      message: "\"Last one. How visible is responsible external decision-making — around suppliers, partners, and longer-term impact — in your everyday work?\"",
      choices: SCALE_CHOICES,
    },
    {
      id: "chain_confidence",
      speaker: "Hazel",
      message: "\"How confident are you in that view of the wider organisation?\"",
      choices: CONFIDENCE_CHOICES,
    },
    {
      id: "chain_outro",
      speaker: "Hazel",
      message:
        "\"A company's sustainability story is really the sum of every decision like this one — made at every level, in every procurement conversation, often with nobody watching. What you just shared is part of that picture. It matters more than the sustainability statement.\"",
      choices: [],
    },
  ],
};

// ============================================================================
// Lookup helpers
// ============================================================================

const SURVEY_MAP = {
  frank: FRANK_SURVEY,
  otis:  OTIS_SURVEY,
  suzy:  SUZY_SURVEY,
  hazel: HAZEL_SURVEY,
};

export function getSurveySectionForNpc(npcId) {
  return SURVEY_MAP[npcId] || null;
}

// ============================================================================
// Scoring map (kept for results reporting)
// ============================================================================

export const SURVEY_SCORING = {
  env: {
    pillar: "Environmental Stewardship",
    behavior_key:  "env_scenario_personal",
    org_key:       "env_scenario_delaware",
  },
  people: {
    pillar: "People & Culture",
    behavior_key:  "people_scenario_personal",
    org_key:       "people_scenario_delaware",
  },
  conduct: {
    pillar: "Business Conduct",
    behavior_key:  "conduct_scenario_personal",
    org_key:       "conduct_scenario_delaware",
  },
  chain: {
    pillar: "Responsible Value Chain",
    behavior_key:  "chain_scenario_personal",
    org_key:       "chain_scenario_delaware",
  },
};

/**
 * Convert survey steps to the sequence dialog format.
 * With the streamlined surveys, there are no conditional follow-up branches.
 */
export function convertSurveyToDialogSequence(surveyData) {
  const steps = surveyData.steps
    .filter((step) => !step.id.endsWith("_outro"))
    .map((step) => ({
      ...step,
      choices: step.choices.map((choice) => ({
        ...choice,
        choiceValue: null,
        reaction: choice.reaction || null,
      })),
    }));

  return {
    type: "sequence",
    steps,
    followUpStepsMap: {},
    reaction: surveyData.finalReaction || "\"Thank you. That perspective helps.\"",
    pillarNpcId: surveyData.npcId,
  };
}
