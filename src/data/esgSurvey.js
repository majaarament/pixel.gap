/**
 * ESG Pillar Survey Dialogue Data
 * Defines branching conversations for the 4 main NPCs (frank, otis, suzy, hazel)
 * Each NPC represents a pillar: Environment, People, Conduct, Value Chain
 */

// ============================================================================
// PILLAR 1: ENVIRONMENTAL STEWARDSHIP (frank)
// ============================================================================

export const FRANK_SURVEY = {
  npcId: "frank",
  npcName: "Frank",
  npcRole: "Environmental Lead",
  pillarKey: "env",
  steps: [
    {
      id: "env_intro",
      speaker: "Frank",
      message:
        "Hey… good thing you're here. We're about to finish this project, but there's a shortcut that would save us some time. Only thing is, it creates quite a bit more waste than usual. No one's really questioning it.",
      choices: [],
    },
    {
      id: "env_behavioral",
      speaker: "Frank",
      message: "What feels like the best move for you?",
      choices: [
        {
          key: "env_b_fast",
          label:
            "Stick with the faster option, deadlines matter too",
          reaction:
            '"Yeah… deadlines do have a way of taking over everything."',
          value: 1,
        },
        {
          key: "env_b_suggest",
          label: "Bring it up and suggest a less wasteful approach",
          reaction:
            '"That\'s fair. It can be tricky to bring that up though."',
          value: 3,
        },
        {
          key: "env_b_follow",
          label: "Follow what the team is already doing",
          reaction:
            '"I get that. It\'s not always easy to go against the flow."',
          value: 2,
        },
        {
          key: "env_b_reduce",
          label: "Try to reduce the waste a bit without slowing things down",
          reaction:
            '"Subtle… sometimes that feels like the only realistic option."',
          value: 2,
        },
      ],
    },
    {
      id: "env_org_perception",
      speaker: "Frank",
      message:
        'Out of curiosity… what do you think would actually be prioritised in this situation?',
      choices: [
        {
          key: "env_o_deliver",
          label:
            "Delivering on time, even if it's less sustainable",
          value: 1,
        },
        {
          key: "env_o_balance",
          label: "Finding a balance between speed and environmental impact",
          value: 2,
        },
        {
          key: "env_o_impact",
          label: "Reducing environmental impact, even if it takes longer",
          value: 3,
        },
        {
          key: "env_o_depends",
          label: "It depends on the team or manager",
          value: null,
        },
      ],
    },
    {
      id: "env_visibility",
      speaker: "Frank",
      message:
        "And thinking more generally… how often do people around you actually think about environmental impact when making decisions at work?",
      choices: [
        { key: "env_v_often", label: "Very often", value: 4 },
        { key: "env_v_sometimes", label: "Sometimes", value: 3 },
        { key: "env_v_rarely", label: "Rarely", value: 2 },
        { key: "env_v_never", label: "Almost never", value: 1 },
      ],
    },
    {
      id: "env_reflection",
      speaker: "Frank",
      message:
        '"There\'s often a bit of a gap between what\'s said and what happens. Where do you notice the biggest difference between environmental goals that are talked about and what actually happens in practice at work?"',
      choices: [
        {
          key: "env_r_free",
          label: "[Open reflection - text response]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "env_outro",
      speaker: "Frank",
      message:
        '"Funny how it\'s rarely one big decision, right… it\'s all these small choices that quietly shape what actually happens. Anyway, might be worth seeing how things play out elsewhere too: I heard the next guide has been wanting to talk to you, go pay them a visit."',
      choices: [],
    },
  ],
};

// ============================================================================
// PILLAR 2: PEOPLE & CULTURE (otis)
// ============================================================================

export const OTIS_SURVEY = {
  npcId: "otis",
  npcName: "Otis",
  npcRole: "People Operations",
  pillarKey: "people",
  steps: [
    {
      id: "people_intro",
      speaker: "Otis",
      message:
        "Hey, I was looking for you! Can I get your take on something? We've been pushing hard to meet deadlines lately… One of our teammates clearly looks overwhelmed, but no one's really saying anything.",
      choices: [],
    },
    {
      id: "people_behavioral",
      speaker: "Otis",
      message: "What would you do in this moment?",
      choices: [
        {
          key: "people_b_checkin",
          label: "Check in with them and offer support",
          reaction:
            '"Yeah… even a small check-in can mean a lot sometimes."',
          value: 3,
        },
        {
          key: "people_b_manager",
          label: "Mention it to the team or manager",
          reaction:
            '"That makes sense. Managers are supposed to keep an eye on this kind of thing after all."',
          value: 2,
        },
        {
          key: "people_b_assume",
          label: "Assume they'll speak up if it's serious",
          reaction:
            '"I understand… but not everyone finds it easy to speak up."',
          value: 1,
        },
        {
          key: "people_b_focus",
          label: "Focus on your own tasks for now",
          reaction: '"I get it. When things are busy, it\'s hard to take on more."',
          value: 0,
        },
      ],
    },
    {
      id: "people_org_perception",
      speaker: "Otis",
      message:
        "In your opinion, what usually happens in situations like this?",
      choices: [
        {
          key: "people_o_support",
          label: "People actively support each other",
          value: 3,
        },
        {
          key: "people_o_noticed",
          label: "It gets noticed, but not always addressed",
          value: 2,
        },
        {
          key: "people_o_individual",
          label: "It's mostly left to individuals to manage",
          value: 1,
        },
        {
          key: "people_o_depends",
          label: "It depends on the team",
          value: null,
          followUp: "people_org_depends",
        },
      ],
    },
    {
      id: "people_org_depends",
      speaker: "Otis",
      message:
        '"Yeah… I hear that a lot actually. It can feel pretty different depending on where you are. And just thinking about your own team… what do you think makes that difference?"',
      choices: [
        {
          key: "people_od_culture",
          label: "[Open reflection - what makes the difference]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "people_safety",
      speaker: "Otis",
      message:
        "How safe do you feel to speak up about issues like this in your team?",
      choices: [
        {
          key: "people_s_very",
          label: "Very safe",
          value: 4,
        },
        {
          key: "people_s_somewhat",
          label: "Somewhat safe",
          value: 3,
          followUp: "people_safety_followup",
        },
        {
          key: "people_s_notvery",
          label: "Not very safe",
          value: 2,
          followUp: "people_safety_followup",
        },
        {
          key: "people_s_notsafe",
          label: "Not safe at all",
          value: 1,
          followUp: "people_safety_followup",
        },
      ],
    },
    {
      id: "people_safety_followup",
      speaker: "Otis",
      message:
        '"Ah… yeah, that\'s honestly something I hear quite often. It\'s not always easy to speak up, even when something feels off. (Please be honest here—your answer isn\'t linked back to you.) What tends to make it harder to speak up in situations like this?"',
      choices: [
        {
          key: "people_sf_harder",
          label:
            "[Open reflection - what makes it harder? (topics, situations, dynamics)]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "people_support_themes",
      speaker: "Otis",
      message:
        '"It\'s interesting how much these things depend on the environment people are in. What do you think would make people feel more supported in situations like these?"',
      choices: [
        {
          key: "people_st_support",
          label: "[Open reflection - what would help]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "people_outro",
      speaker: "Otis",
      message:
        '"It\'s strange… people talk a lot about team culture, but in the end it\'s really just moments like these that define it. I guess it makes you wonder how things feel in other parts of the company too. The next guide might have some insight on that now that I\'m thinking about it."',
      choices: [],
    },
  ],
};

// ============================================================================
// PILLAR 3: BUSINESS CONDUCT (suzy)
// ============================================================================

export const SUZY_SURVEY = {
  npcId: "suzy",
  npcName: "Suzy",
  npcRole: "Compliance & Ethics",
  pillarKey: "conduct",
  steps: [
    {
      id: "conduct_intro",
      speaker: "Suzy",
      message:
        "Hey there, didn't see you there! Funny thing… I've been watching how things run around here lately and I've noticed a pattern. Little shortcuts here, a rule bent there… nothing that stops things from working, just things that technically shouldn't happen either. And for most people it just becomes normal.",
      choices: [],
    },
    {
      id: "conduct_behavioral",
      speaker: "Suzy",
      message: 'What would feel like the right response for you in this scenario?',
      choices: [
        {
          key: "conduct_b_direct",
          label: "Speak up and address it directly",
          reaction:
            '"That takes a bit of courage… especially if no one else is saying anything."',
          value: 3,
        },
        {
          key: "conduct_b_advice",
          label: "Ask someone else for advice first",
          reaction:
            '"Yeah, keeping an eye on it first can feel like the safer move."',
          value: 2,
        },
        {
          key: "conduct_b_ignore",
          label: "Ignore it unless it becomes a bigger issue",
          reaction:
            '"I get that… it\'s easy to let small things slide when nothing seems urgent."',
          value: 1,
        },
        {
          key: "conduct_b_trust",
          label: "Trust that someone else will handle it",
          reaction:
            '"That happens a lot more than people like to admit."',
          value: 0,
        },
      ],
    },
    {
      id: "conduct_org_perception",
      speaker: "Suzy",
      message:
        "What have you usually seen happening at work in these cases?",
      choices: [
        {
          key: "conduct_o_serious",
          label: "Issues like this are taken seriously and addressed",
          value: 3,
        },
        {
          key: "conduct_o_acknowledged",
          label: "They're acknowledged but not always followed up",
          value: 2,
        },
        {
          key: "conduct_o_overlooked",
          label: "They're often overlooked unless they escalate",
          value: 1,
        },
        {
          key: "conduct_o_depends",
          label: "It depends on who is involved",
          value: null,
          followUp: "conduct_org_depends",
        },
      ],
    },
    {
      id: "conduct_org_depends",
      speaker: "Suzy",
      message:
        '"Yeah… that\'s interesting. It can feel pretty inconsistent sometimes. What do you think it depends on most?"',
      choices: [
        {
          key: "conduct_od_depends",
          label: "[Open reflection - what does it depend on]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "conduct_safety",
      speaker: "Suzy",
      message:
        '"How comfortable would you feel raising something like this?"',
      choices: [
        {
          key: "conduct_s_very",
          label: "Very comfortable",
          value: 4,
        },
        {
          key: "conduct_s_somewhat",
          label: "Somewhat comfortable",
          value: 3,
        },
        {
          key: "conduct_s_notvery",
          label: "Not very comfortable",
          value: 2,
        },
        {
          key: "conduct_s_notsafe",
          label: "Not comfortable at all",
          value: 1,
        },
      ],
    },
    {
      id: "conduct_reflection",
      speaker: "Suzy",
      message:
        '"Yeah… it\'s rarely as simple as just speaking up or staying quiet. A lot of little things can make a difference in that moment. What makes it easier or harder to speak up in practice?"',
      choices: [
        {
          key: "conduct_r_factors",
          label: "[Open reflection - what makes it easier or harder]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "conduct_outro",
      speaker: "Suzy",
      message:
        '"Well, ultimately it\'s never really about one big rule being broken… it\'s more about what people get used to over time. You start to notice patterns, once you\'re looking for them. {nextNpc} might have some thoughts on this too."',
      choices: [],
    },
  ],
};

// ============================================================================
// PILLAR 4: RESPONSIBLE VALUE CHAIN (hazel)
// ============================================================================

export const HAZEL_SURVEY = {
  npcId: "hazel",
  npcName: "Hazel",
  npcRole: "Supply Chain Sustainability",
  pillarKey: "chain",
  steps: [
    {
      id: "chain_intro",
      speaker: "Hazel",
      message:
        "Haven't seen you in a while, I need to tell you about this pickle I've been in. We're about to choose a partner for an upcoming project. One option is fast, reliable, and cheaper. The other takes a bit more effort to work with, but they're known for treating people fairly and working more sustainably. There's no obvious right answer. It just depends on what you focus on.",
      choices: [],
    },
    {
      id: "chain_behavioral",
      speaker: "Hazel",
      message:
        "What would you lean toward in this situation?",
      choices: [
        {
          key: "chain_b_efficient",
          label: "The faster, more efficient option",
          reaction:
            '"Yeah… when things are moving quickly, that\'s often what wins."',
          value: 1,
        },
        {
          key: "chain_b_sustainable",
          label: "The more sustainable option",
          reaction:
            '"That can take extra effort… but it does say something about priorities."',
          value: 3,
        },
        {
          key: "chain_b_balance",
          label: "Try to balance both",
          reaction:
            '"Makes sense. Most decisions end up somewhere in the middle."',
          value: 2,
        },
        {
          key: "chain_b_follow",
          label: "Follow what's already been decided",
          reaction: '"Fair. These decisions often don\'t feel fully in your control."',
          value: 0,
        },
      ],
    },
    {
      id: "chain_org_perception",
      speaker: "Hazel",
      message:
        "What do you think is usually prioritised at work?",
      choices: [
        {
          key: "chain_o_efficiency",
          label: "Efficiency and cost",
          value: 1,
        },
        {
          key: "chain_o_balance",
          label: "A balance between responsibility and performance",
          value: 2,
        },
        {
          key: "chain_o_responsibility",
          label: "Responsibility, even if it's slower",
          value: 3,
        },
        {
          key: "chain_o_varies",
          label: "It varies a lot",
          value: null,
          followUp: "chain_org_varies",
        },
      ],
    },
    {
      id: "chain_org_varies",
      speaker: "Hazel",
      message:
        '"Yeah… that makes sense, it\'s rarely the same everywhere. Different teams, different pressures… things don\'t always play out the same way. I\'m curious… can you think of moments where priorities shifted? What influenced that?"',
      choices: [
        {
          key: "chain_ov_shifts",
          label: "[Open reflection - moments where priorities shifted]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "chain_visibility",
      speaker: "Hazel",
      message:
        '"How often are sustainability or long-term impact considered when choosing partners or suppliers?"',
      choices: [
        {
          key: "chain_v_visible",
          label: "Very visible",
          value: 4,
        },
        {
          key: "chain_v_sometimes",
          label: "Sometimes visible",
          value: 3,
        },
        {
          key: "chain_v_rarely",
          label: "Rarely visible",
          value: 2,
        },
        {
          key: "chain_v_notatall",
          label: "Not visible at all",
          value: 1,
        },
      ],
    },
    {
      id: "chain_impact",
      speaker: "Hazel",
      message:
        '"A lot of impact happens through the choices companies make with others. Where do you think the company could make a bigger difference outside of its own work?"',
      choices: [
        {
          key: "chain_i_impact",
          label: "[Open reflection - bigger difference outside]",
          isOpenEnded: true,
        },
      ],
    },
    {
      id: "chain_outro",
      speaker: "Hazel",
      message:
        '"Very interesting! I believe that decisions like these don\'t just stay here… they ripple outward in ways people don\'t always see. I guess it depends on what kind of impact you want to leave behind though. Either way, it might be worth taking a step back and looking at the bigger picture now."',
      choices: [],
    },
  ],
};

// ============================================================================
// Helper function to get survey data by NPC ID
// ============================================================================

const SURVEY_MAP = {
  frank: FRANK_SURVEY,
  otis: OTIS_SURVEY,
  suzy: SUZY_SURVEY,
  hazel: HAZEL_SURVEY,
};

export function getSurveySectionForNpc(npcId) {
  return SURVEY_MAP[npcId] || null;
}

// ============================================================================
// Scoring and Results Mapping
// ============================================================================

export const SURVEY_SCORING = {
  env: {
    pillar: "Environmental Stewardship",
    behavior_key: "env_behavioral",
    org_key: "env_org_perception",
    visibility_key: "env_visibility",
    themes_key: "env_reflection",
  },
  people: {
    pillar: "People & Culture",
    behavior_key: "people_behavioral",
    org_key: "people_org_perception",
    safety_key: "people_safety",
    themes_key: "people_support_themes",
  },
  conduct: {
    pillar: "Business Conduct",
    behavior_key: "conduct_behavioral",
    org_key: "conduct_org_perception",
    safety_key: "conduct_safety",
    themes_key: "conduct_reflection",
  },
  chain: {
    pillar: "Responsible Value Chain",
    behavior_key: "chain_behavioral",
    org_key: "chain_org_perception",
    visibility_key: "chain_visibility",
    themes_key: "chain_impact",
  },
};

/**
 * Convert survey steps to dialog sequence format for the game
 * Extracts choice values and assigns them to steps
 */
export function convertSurveyToDialogSequence(surveyData) {
  return {
    type: "sequence",
    steps: surveyData.steps.map((step) => ({
      ...step,
      choices: step.choices.map((choice) => {
        // If choice has a 'value' field, use it; otherwise look for 'reaction'
        const value = choice.value !== undefined ? choice.value : null;
        const reaction = choice.reaction || null;
        return {
          ...choice,
          choiceValue: value,
          reaction,
        };
      }),
    })),
    reaction: `"Thank you for sharing your perspective on ${surveyData.pillarKey}. It helps understand how these values actually show up in practice."`,
    pillarNpcId: surveyData.npcId,
  };
}
