/**
 * ESG Pillar Survey Dialogue — streamlined edition.
 *
 * Each NPC has exactly 5 steps:
 *   1. intro   — NPC presents a concrete scenario (no choices, player presses continue)
 *   2. personal — "what would you do?" (4 choices, each with an NPC reaction)
 *   3. delaware — "what do you think would actually happen here?" (4 choices, no reactions)
 *   4. scale   — "how often do you see this in practice?" (1-5 scale)
 *   5. outro   — brief NPC sign-off (no choices, player presses continue)
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

// ============================================================================
// PILLAR 1: ENVIRONMENTAL STEWARDSHIP — Frank the Fish
// ============================================================================

export const FRANK_SURVEY = {
  npcId: "frank",
  npcName: "Frank the Fish",
  npcRole: "Environmental Stewardship",
  pillarKey: "env",
  finalReaction: "\"Digital decisions are the new invisible environmental ones. Nobody sees the data centre. Nobody feels the compute cost. That's why it matters that someone doesn't look away.\"",
  steps: [
    {
      id: "env_intro",
      speaker: "Frank",
      message:
        "\"Good timing. I've been sitting on a recommendation I need to make.\"\n\nPlayer\n\"What's the situation?\"\n\nFrank\n\"A client project. We're choosing between two AI models. The high-accuracy one requires roughly eight times more compute — more energy, more carbon cost. The lighter model covers most use cases well enough. The client hasn't asked about environmental cost. They've only asked about performance.\"",
      choices: [],
    },
    {
      id: "env_scenario_personal",
      speaker: "Frank",
      message: "\"If this were your recommendation to make — what would you lean toward?\"",
      choices: [
        {
          key: "flag_energy",
          label: "Flag the energy cost to the client and factor it into the recommendation.",
          reaction: "\"That's the harder conversation to have. Most clients haven't asked for it. But once you name it, they usually want to know.\"",
        },
        {
          key: "lighter_model",
          label: "Recommend the lighter model as default — performance is sufficient and the footprint is lower.",
          reaction: "\"Pragmatic. You're still making a sustainability call — just making it quietly.\"",
        },
        {
          key: "note_internally",
          label: "Note it internally as a sustainability consideration but lead with performance in the client conversation.",
          reaction: "\"It's in the record, at least. Though if no one reads the footnote, the same model gets chosen again next time.\"",
        },
        {
          key: "full_info",
          label: "Give the client full cost information — performance and carbon — and let them decide.",
          reaction: "\"That's putting it back where it belongs. They commissioned the work — they should own the full picture.\"",
        },
      ],
    },
    {
      id: "env_scenario_delaware",
      speaker: "Frank",
      message: "\"And what do you think delaware would expect a consultant to do in a situation like this?\"",
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
      id: "env_outro",
      speaker: "Frank",
      message:
        "\"Digital decisions leave no visible trace — no runoff, no smoke — but they accumulate quietly. That's worth seeing how it looks in the other zones too.\"",
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
  finalReaction: "\"People situations don't resolve neatly. Thanks for thinking it through honestly.\"",
  steps: [
    {
      id: "people_intro",
      speaker: "Otis",
      message:
        "\"Hey, I was hoping to get your take on something. Project pressure is high this sprint, and one person on the team has been quietly absorbing extra load for weeks.\"\n\nPlayer\n\"Have they said anything?\"\n\nOtis\n\"Not officially. They say they're fine. But it's obvious to anyone paying attention — leadership is just focused on the deadline.\"",
      choices: [],
    },
    {
      id: "people_scenario_personal",
      speaker: "Otis",
      message: "\"What would you do in this moment?\"",
      choices: [
        {
          key: "raise_now",
          label: "Raise it now — waiting makes the pattern harder to break.",
          reaction: "\"That takes real willingness to make things uncomfortable before they get worse. Not everyone does.\"",
        },
        {
          key: "check_in",
          label: "Check in with them privately first, then decide how to escalate.",
          reaction: "\"A quiet check-in first — that at least gives the person some agency in how the situation gets raised.\"",
        },
        {
          key: "let_lead",
          label: "Leave it for the team lead or manager — that's their role.",
          reaction: "\"Relying on the chain of command. Fair, if the chain is actually paying attention.\"",
        },
        {
          key: "document",
          label: "Note what you're seeing and flag it after the immediate pressure passes.",
          reaction: "\"Watching and waiting. Sometimes the right call — sometimes it's already too late by the time the deadline lifts.\"",
        },
      ],
    },
    {
      id: "people_scenario_delaware",
      speaker: "Otis",
      message: "\"What do you think happens in situations like this here, usually? What would delaware expect someone to do?\"",
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
      choices: SCALE_CHOICES,
    },
    {
      id: "people_outro",
      speaker: "Otis",
      message:
        "\"It's strange. People talk a lot about team culture, but in the end it's really just moments like these that define it. The next guide might have some thoughts on how it looks elsewhere.\"",
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
  finalReaction: "\"It's never really about one big rule being broken. It's what people get used to over time.\"",
  steps: [
    {
      id: "conduct_intro",
      speaker: "Suzy",
      message:
        "\"I've been watching how things run around here lately. A colleague shows you a workaround that saves three days of compliance checks. It's not against any written rule — but it bypasses the spirit of the process.\"\n\nPlayer\n\"Is there any risk?\"\n\nSuzy\n\"Not immediately. But if something goes wrong later, there's no paper trail for why it was skipped. And apparently other teams do it regularly.\"",
      choices: [],
    },
    {
      id: "conduct_scenario_personal",
      speaker: "Suzy",
      message: "\"What would feel like the right response for you?\"",
      choices: [
        {
          key: "follow_proper",
          label: "Follow the full process — the shortcut isn't worth the downstream risk.",
          reaction: "\"That's the textbook answer. It's also the slower one. Takes real conviction to hold that line when everyone else is moving fast.\"",
        },
        {
          key: "flag_up",
          label: "Flag the workaround to a manager before deciding — get clarity on whether it's acceptable.",
          reaction: "\"Checking before acting. Harder than it sounds when the deadline is tomorrow and no one else seems bothered.\"",
        },
        {
          key: "use_workaround",
          label: "Use the workaround this time — it's common practice and the deadline matters.",
          reaction: "\"'Common practice' is doing a lot of work there. But I understand how it happens. It usually starts exactly like this.\"",
        },
        {
          key: "suggest_review",
          label: "Use it now but push for a formal review so it's either approved or fixed properly.",
          reaction: "\"Pragmatic and constructive — if the review actually happens. That second half is where it usually falls apart.\"",
        },
      ],
    },
    {
      id: "conduct_scenario_delaware",
      speaker: "Suzy",
      message: "\"What do you think delaware's leadership would expect someone to do here?\"",
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
      choices: SCALE_CHOICES,
    },
    {
      id: "conduct_outro",
      speaker: "Suzy",
      message:
        "\"You start to notice patterns, once you're looking for them. The next guide has been thinking about a different angle on this — might be worth a conversation.\"",
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
  finalReaction: "\"Decisions like these don't stay here. They ripple outward in ways people don't always see.\"",
  steps: [
    {
      id: "chain_intro",
      speaker: "Hazel",
      message:
        "\"I need to tell you about this supplier decision we're facing. One option is fast, reliable, and 12% cheaper. The other takes more effort to onboard, but they're known for treating people fairly and operating sustainably.\"\n\nPlayer\n\"Is there pressure to go with the cheaper option?\"\n\nHazel\n\"There's always pressure. And the contract is long-term — whatever we choose, we're committed to it for years.\"",
      choices: [],
    },
    {
      id: "chain_scenario_personal",
      speaker: "Hazel",
      message: "\"What would you lean toward in this decision?\"",
      choices: [
        {
          key: "responsible",
          label: "Go with the responsible supplier — the cost difference is worth the alignment.",
          reaction: "\"That's a harder argument to make when procurement is watching the numbers. Takes real conviction to hold the line there.\"",
        },
        {
          key: "negotiate",
          label: "Try to negotiate the lower-cost supplier to improve their standards as a condition.",
          reaction: "\"Using procurement leverage. It works when you actually have it — and when you're willing to walk away if they don't move.\"",
        },
        {
          key: "cost",
          label: "Go with the lower-cost option — the business case has to hold up.",
          reaction: "\"The business case wins. That's honest. It's how most of these decisions actually land, whatever the sustainability statement says.\"",
        },
        {
          key: "escalate",
          label: "Escalate the trade-off to leadership — this decision is too significant for this level.",
          reaction: "\"Pushing it upward. That at least makes the trade-off visible rather than invisible — which is already something.\"",
        },
      ],
    },
    {
      id: "chain_scenario_delaware",
      speaker: "Hazel",
      message: "\"What do you think delaware would actually prioritise in a supplier decision like this?\"",
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
      id: "chain_outro",
      speaker: "Hazel",
      message:
        "\"I believe the choices a company makes with others say more than the choices it makes about itself. Worth taking that thought into the next part of the journey.\"",
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
  const steps = surveyData.steps.map((step) => ({
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
