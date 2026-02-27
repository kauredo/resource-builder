import type {
  ResourceType,
  EmotionCardContent,
  FlashcardsContent,
  WorksheetContent,
  PosterContent,
  BoardGameContent,
  CardGameContent,
  BookContent,
  BehaviorChartContent,
  VisualScheduleContent,
} from "@/types";

export interface StarterTemplate {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  theme: string;
  contentSummary: string;
  content: Record<string, unknown>;
}

export const STARTER_THEMES = [
  "anxiety",
  "anger",
  "social-skills",
  "self-esteem",
  "emotions",
  "mindfulness",
  "cbt",
] as const;

export type StarterTheme = (typeof STARTER_THEMES)[number];

export const THEME_LABELS: Record<StarterTheme, string> = {
  anxiety: "Anxiety",
  anger: "Anger",
  "social-skills": "Social Skills",
  "self-esteem": "Self-Esteem",
  emotions: "Emotions",
  mindfulness: "Mindfulness",
  cbt: "CBT",
};

export const RESOURCE_TYPE_LABELS: Record<Exclude<ResourceType, "free_prompt">, string> = {
  emotion_cards: "Emotion Cards",
  flashcards: "Flashcards",
  poster: "Poster",
  worksheet: "Worksheet",
  board_game: "Board Game",
  card_game: "Card Game",
  book: "Book",
  behavior_chart: "Behavior Chart",
  visual_schedule: "Visual Schedule",
};

// --- Emotion Cards ---

const anxietyEmotionCards: EmotionCardContent = {
  cards: [
    { emotion: "Worried", description: "A tight feeling in your chest when you think something bad might happen" },
    { emotion: "Nervous", description: "Butterflies in your stomach before something new or scary" },
    { emotion: "Panicked", description: "Your heart races and you feel like you need to escape right now" },
    { emotion: "Overwhelmed", description: "Too many feelings at once, like a wave crashing over you" },
    { emotion: "Restless", description: "You can't sit still and your mind keeps jumping around" },
    { emotion: "Fearful", description: "Something feels dangerous even when you know you're safe" },
    { emotion: "Tense", description: "Your muscles are tight and your body feels stiff and on guard" },
    { emotion: "Relieved", description: "The worry finally goes away and your body feels light again" },
  ],
  layout: {
    cardsPerPage: 4,
    cardSize: "medium",
    showLabels: true,
    showDescriptions: true,
  },
};

const primaryEmotionCards: EmotionCardContent = {
  cards: [
    { emotion: "Happy", description: "A warm, bright feeling when something good happens" },
    { emotion: "Sad", description: "A heavy feeling inside, like a raincloud following you" },
    { emotion: "Angry", description: "A hot feeling that makes you want to stomp or shout" },
    { emotion: "Scared", description: "Your body wants to run or hide from something" },
    { emotion: "Surprised", description: "Something unexpected happened and your eyes go wide" },
    { emotion: "Disgusted", description: "Something feels yucky or wrong and you want to push it away" },
    { emotion: "Calm", description: "Everything feels peaceful and still, like a quiet pond" },
    { emotion: "Excited", description: "Bubbly energy that makes you want to jump and smile" },
  ],
  layout: {
    cardsPerPage: 4,
    cardSize: "medium",
    showLabels: true,
    showDescriptions: true,
  },
};

// --- Flashcards ---

const anxietyFlashcards: FlashcardsContent = {
  cards: [
    {
      id: "fc-anx-1",
      frontText: "Deep Breathing",
      backText: "Breathe in for 4 counts, hold for 4, breathe out for 4. This activates your body's calm-down system.",
      imagePrompt: "A child sitting peacefully with eyes closed, surrounded by gentle swirling air currents",
    },
    {
      id: "fc-anx-2",
      frontText: "5-4-3-2-1 Grounding",
      backText: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. This brings you back to the present moment.",
      imagePrompt: "A child looking around with curiosity, noticing different sensory details in a colorful environment",
    },
    {
      id: "fc-anx-3",
      frontText: "Worry Box",
      backText: "Write your worry on a piece of paper, fold it up, and put it in your worry box. You can deal with it later when you're ready.",
      imagePrompt: "A decorated box with a slot on top, surrounded by small folded papers",
    },
    {
      id: "fc-anx-4",
      frontText: "Muscle Squeeze",
      backText: "Squeeze your fists tight for 5 seconds, then let go. Feel the difference between tense and relaxed.",
      imagePrompt: "A child squeezing their fists with determination, then opening their hands with relaxation",
    },
    {
      id: "fc-anx-5",
      frontText: "Positive Self-Talk",
      backText: "Replace \"What if something bad happens?\" with \"I can handle this\" or \"I've done hard things before.\"",
      imagePrompt: "A child looking in a mirror with a confident, encouraging expression",
    },
    {
      id: "fc-anx-6",
      frontText: "Safe Place Visualization",
      backText: "Close your eyes and picture your favourite safe, happy place. Notice what you see, hear, and feel there.",
      imagePrompt: "A dreamy, peaceful landscape with soft colours representing a child's safe imaginary place",
    },
    {
      id: "fc-anx-7",
      frontText: "Body Scan",
      backText: "Starting from your toes, slowly move your attention up through your body. Notice where you feel tight or uncomfortable.",
      imagePrompt: "A child lying down relaxed, with gentle glowing light moving from their feet to their head",
    },
    {
      id: "fc-anx-8",
      frontText: "Butterfly Hug",
      backText: "Cross your arms over your chest and tap your shoulders one at a time, like a butterfly flapping its wings.",
      imagePrompt: "A child giving themselves a butterfly hug with crossed arms and gentle expression",
    },
  ],
};

const socialSkillsFlashcards: FlashcardsContent = {
  cards: [
    {
      id: "fc-soc-1",
      frontText: "Starting a Conversation",
      backText: "Smile, make eye contact, and say something about what's happening. Try: \"Hi! What are you playing?\" or \"That looks fun!\"",
      imagePrompt: "Two children meeting and smiling, one waving hello to the other",
    },
    {
      id: "fc-soc-2",
      frontText: "Taking Turns",
      backText: "When playing or talking, everyone gets a turn. Wait for your turn patiently and say \"Your turn!\" when you're done.",
      imagePrompt: "Children in a circle taking turns with a game, one child passing to the next",
    },
    {
      id: "fc-soc-3",
      frontText: "Listening Skills",
      backText: "Face the person, look at their eyes, keep your body still, and think about what they're saying before you respond.",
      imagePrompt: "A child leaning in attentively while another child speaks, showing active listening",
    },
    {
      id: "fc-soc-4",
      frontText: "Saying Sorry",
      backText: "Name what you did: \"I'm sorry I...\" Say how the other person might feel. Ask what you can do to help fix it.",
      imagePrompt: "One child apologising to another with a sincere expression, the other starting to smile",
    },
    {
      id: "fc-soc-5",
      frontText: "Sharing",
      backText: "Offer to share by saying \"Do you want to use this too?\" Take turns, or find a way to use it together.",
      imagePrompt: "Two children happily sharing toys or art supplies together",
    },
    {
      id: "fc-soc-6",
      frontText: "Dealing with Disagreements",
      backText: "Stay calm, use words not actions. Say how you feel: \"I feel upset because...\" Try to find a solution together.",
      imagePrompt: "Two children talking calmly through a disagreement, with thought bubbles showing compromise",
    },
  ],
};

const angerFlashcards: FlashcardsContent = {
  cards: [
    {
      id: "fc-ang-1",
      frontText: "Anger Thermometer",
      backText: "Rate your anger 1-10. Under 5? Try calm-down strategies. Over 5? Take a break first, then come back to solve the problem.",
      imagePrompt: "A large thermometer with colours from cool blue at the bottom to hot red at the top",
    },
    {
      id: "fc-ang-2",
      frontText: "Cool-Down Corner",
      backText: "Go to a quiet spot, take 10 deep breaths, squeeze a stress ball, or draw how you feel. Come back when you're below a 5.",
      imagePrompt: "A cozy corner with cushions, a stress ball, and drawing supplies",
    },
    {
      id: "fc-ang-3",
      frontText: "Stop, Think, Act",
      backText: "STOP before you react. THINK about what will happen next. ACT by choosing the best response.",
      imagePrompt: "Three panels showing a stop sign, a thinking face, and a child making a good choice",
    },
    {
      id: "fc-ang-4",
      frontText: "I-Statements",
      backText: "Instead of \"You made me angry!\", try \"I feel angry when... because... I need...\" This helps others understand you.",
      imagePrompt: "A child speaking calmly with a speech bubble showing an I-statement",
    },
    {
      id: "fc-ang-5",
      frontText: "Physical Release",
      backText: "Run on the spot, do jumping jacks, push against a wall, or squeeze a pillow. Moving your body helps release anger safely.",
      imagePrompt: "A child doing jumping jacks with energetic lines around them, looking determined",
    },
    {
      id: "fc-ang-6",
      frontText: "Turtle Technique",
      backText: "Like a turtle going into its shell: stop, tuck in (cross arms, head down), take 3 breaths, think of a plan, come out and try it.",
      imagePrompt: "A friendly turtle pulling into its shell, then coming back out with a calm expression",
    },
  ],
};

// --- Worksheets ---

const cbtThoughtWorksheet: WorksheetContent = {
  title: "Thought Detective Worksheet",
  blocks: [
    { id: "w-cbt-1", type: "heading", text: "Thought Detective" },
    { id: "w-cbt-2", type: "prompt", text: "What happened? Describe the situation:" },
    { id: "w-cbt-3", type: "lines", lines: 3 },
    { id: "w-cbt-4", type: "prompt", text: "What thought popped into your head?" },
    { id: "w-cbt-5", type: "lines", lines: 2 },
    { id: "w-cbt-6", type: "prompt", text: "How did that thought make you feel?" },
    { id: "w-cbt-7", type: "checklist", items: ["Sad", "Angry", "Worried", "Scared", "Frustrated", "Embarrassed"] },
    { id: "w-cbt-8", type: "scale", text: "How strong was this feeling?", scaleLabels: { min: "A little", max: "A lot" } },
    { id: "w-cbt-9", type: "prompt", text: "Is there another way to think about this situation?" },
    { id: "w-cbt-10", type: "lines", lines: 3 },
    { id: "w-cbt-11", type: "prompt", text: "What would you tell a friend who had this thought?" },
    { id: "w-cbt-12", type: "lines", lines: 2 },
    { id: "w-cbt-13", type: "prompt", text: "Now how do you feel?" },
    { id: "w-cbt-14", type: "scale", text: "Rate your feeling now:", scaleLabels: { min: "A little", max: "A lot" } },
  ],
};

const selfEsteemWorksheet: WorksheetContent = {
  title: "My Strengths Star",
  blocks: [
    { id: "w-se-1", type: "heading", text: "My Strengths Star" },
    { id: "w-se-2", type: "text", text: "Everyone has strengths — things they're good at or qualities that make them special. Let's discover yours!" },
    { id: "w-se-3", type: "prompt", text: "Write 3 things you're good at:" },
    { id: "w-se-4", type: "lines", lines: 3 },
    { id: "w-se-5", type: "prompt", text: "Write 3 kind things about yourself:" },
    { id: "w-se-6", type: "lines", lines: 3 },
    { id: "w-se-7", type: "prompt", text: "A time I did something brave:" },
    { id: "w-se-8", type: "lines", lines: 2 },
    { id: "w-se-9", type: "prompt", text: "Something nice someone said about me:" },
    { id: "w-se-10", type: "lines", lines: 2 },
    { id: "w-se-11", type: "scale", text: "How much do I believe in myself today?", scaleLabels: { min: "Not much", max: "A lot!" } },
    { id: "w-se-12", type: "prompt", text: "Draw yourself as a superhero with your strengths as powers:" },
    { id: "w-se-13", type: "drawing_box", height: 150 },
  ],
};

const mindfulnessWorksheet: WorksheetContent = {
  title: "My Mindful Moment",
  blocks: [
    { id: "w-mf-1", type: "heading", text: "My Mindful Moment" },
    { id: "w-mf-2", type: "text", text: "Take a slow, deep breath. Now let's notice what's happening right now." },
    { id: "w-mf-3", type: "prompt", text: "Right now, I can see:" },
    { id: "w-mf-4", type: "lines", lines: 2 },
    { id: "w-mf-5", type: "prompt", text: "Right now, I can hear:" },
    { id: "w-mf-6", type: "lines", lines: 2 },
    { id: "w-mf-7", type: "prompt", text: "Right now, my body feels:" },
    { id: "w-mf-8", type: "checklist", items: ["Relaxed", "Tense", "Warm", "Cold", "Tingly", "Heavy", "Light"] },
    { id: "w-mf-9", type: "prompt", text: "Draw what calm looks like to you:" },
    { id: "w-mf-10", type: "drawing_box", height: 120 },
    { id: "w-mf-11", type: "scale", text: "How calm do I feel now?", scaleLabels: { min: "Not calm", max: "Very calm" } },
    { id: "w-mf-12", type: "prompt", text: "One thing I'm grateful for today:" },
    { id: "w-mf-13", type: "lines", lines: 2 },
  ],
};

// --- Posters ---

const anxietyPoster: PosterContent = {
  headline: "When I Feel Worried, I Can...",
  subtext: "Take deep breaths. Talk to someone I trust. Remember: feelings come and go like clouds in the sky.",
  imageAssetKey: "poster:main",
};

const angerPoster: PosterContent = {
  headline: "My Cool-Down Plan",
  subtext: "Stop. Breathe. Think. Choose. I am in control of my actions, even when I feel angry.",
  imageAssetKey: "poster:main",
};

// --- Board Games ---

const emotionsBoardGame: BoardGameContent = {
  grid: {
    rows: 6,
    cols: 6,
    cells: Array.from({ length: 36 }, (_, i) => ({
      label: i === 0 ? "Start" : i === 35 ? "Finish!" : `${i}`,
    })),
  },
  boardImagePrompt: "A colorful winding board game path through a landscape of different emotion zones — a happy sunny meadow, a stormy anger mountain, a calm ocean of sadness, and a bright surprise garden",
  tokens: [
    { name: "Sunshine", color: "#FFD700" },
    { name: "Ocean", color: "#4FC3F7" },
    { name: "Forest", color: "#66BB6A" },
    { name: "Berry", color: "#AB47BC" },
  ],
  cards: [
    { title: "Feelings Check", text: "Name one emotion you felt today. Move forward 2 spaces." },
    { title: "Act It Out", text: "Show a 'surprised' face. If someone guesses it, move forward 3 spaces." },
    { title: "Calm Strategy", text: "Teach everyone one way to calm down. Move forward 2 spaces." },
    { title: "Kindness Card", text: "Say something kind about the person on your left. Move forward 1 space." },
    { title: "Deep Breath", text: "Everyone take 3 deep breaths together. All players move forward 1 space." },
    { title: "Emotion Story", text: "Tell about a time you felt angry. How did you handle it? Move forward 2 spaces." },
    { title: "Body Language", text: "Show how your body looks when you're sad. Move forward 1 space." },
    { title: "Helper Card", text: "Name someone you can talk to when you feel scared. Move forward 2 spaces." },
  ],
};

// --- Card Games ---

const selfEsteemCardGame: CardGameContent = {
  deckName: "Strengths & Powers",
  rules: "Shuffle the deck. Take turns drawing a card. Read it aloud and answer honestly. If you share something personal, other players say one nice thing about you.",
  backgrounds: [
    { id: "bg-1", label: "Strengths", color: "#FF7043", imagePrompt: "Warm orange gradient background with subtle star patterns", imageAssetKey: "card_bg:strengths" },
    { id: "bg-2", label: "Challenges", color: "#42A5F5", imagePrompt: "Cool blue gradient background with gentle mountain shapes", imageAssetKey: "card_bg:challenges" },
    { id: "bg-3", label: "Kindness", color: "#66BB6A", imagePrompt: "Soft green gradient background with heart shapes", imageAssetKey: "card_bg:kindness" },
  ],
  icons: [
    { id: "ic-1", label: "Star", imagePrompt: "A golden star with a friendly face", imageAssetKey: "card_icon:star" },
    { id: "ic-2", label: "Heart", imagePrompt: "A warm red heart with gentle glow", imageAssetKey: "card_icon:heart" },
  ],
  textSettings: {
    fontFamily: "Plus Jakarta Sans",
    defaultFontSize: 14,
    defaultColor: "#FFFFFF",
    defaultOutlineWidth: 0,
    defaultOutlineColor: "#000000",
    defaultHAlign: "center",
    defaultVAlign: "center",
  },
  cards: [
    { id: "c-1", title: "My Superpower", count: 1, backgroundId: "bg-1", iconId: "ic-1", primaryText: { content: "Name your greatest strength. When do you use it?" } },
    { id: "c-2", title: "Brave Moment", count: 1, backgroundId: "bg-1", iconId: "ic-1", primaryText: { content: "Tell about a time you were brave, even when it was hard." } },
    { id: "c-3", title: "Proud Achievement", count: 1, backgroundId: "bg-1", iconId: "ic-1", primaryText: { content: "What's something you worked really hard on?" } },
    { id: "c-4", title: "Overcome", count: 1, backgroundId: "bg-2", primaryText: { content: "Describe a challenge you've faced. How did you handle it?" } },
    { id: "c-5", title: "Growth Zone", count: 1, backgroundId: "bg-2", primaryText: { content: "What's something you'd like to get better at? What's one step you can take?" } },
    { id: "c-6", title: "Kind Act", count: 1, backgroundId: "bg-3", iconId: "ic-2", primaryText: { content: "Share a time you did something kind for someone else." } },
    { id: "c-7", title: "Friendship", count: 1, backgroundId: "bg-3", iconId: "ic-2", primaryText: { content: "What makes you a good friend?" } },
    { id: "c-8", title: "Self-Care", count: 1, backgroundId: "bg-3", primaryText: { content: "What's one thing you do to take care of yourself?" } },
  ],
};

// --- Books ---

const anxietySocialStory: BookContent = {
  bookType: "social story",
  layout: "picture_book",
  cover: {
    title: "When My Worry Monster Visits",
    subtitle: "A story about learning to be friends with worry",
    imagePrompt: "A gentle, friendly-looking worry monster standing next to a child, both looking at the reader — soft, warm colours",
  },
  pages: [
    {
      id: "p-1",
      text: "Sometimes a little monster visits me. It sits on my shoulder and whispers worries in my ear.",
      imagePrompt: "A small, fluffy monster sitting on a child's shoulder, whispering — not scary, more mischievous",
    },
    {
      id: "p-2",
      text: "\"What if nobody wants to play with you?\" it says. \"What if you get the answer wrong?\"",
      imagePrompt: "The worry monster growing slightly bigger as worry speech bubbles float around the child",
    },
    {
      id: "p-3",
      text: "When the monster talks too loud, my tummy feels funny and my hands get sweaty.",
      imagePrompt: "The child looking uncomfortable with the monster now quite large, holding their tummy",
    },
    {
      id: "p-4",
      text: "But my teacher showed me a secret. I can take a big deep breath — in through my nose, out through my mouth.",
      imagePrompt: "The child taking a deep breath with their eyes closed, a calm wind swirling around them",
    },
    {
      id: "p-5",
      text: "When I breathe, the monster gets smaller. It's still there, but it's not so loud anymore.",
      imagePrompt: "The monster shrinking back to a tiny size as the child breathes calmly and smiles",
    },
    {
      id: "p-6",
      text: "I learned that everyone has a worry monster. Even grown-ups! And that's completely okay.",
      imagePrompt: "Multiple children and adults, each with their own tiny, friendly worry monsters — everyone smiling",
    },
  ],
};

const selfEsteemBook: BookContent = {
  bookType: "social story",
  layout: "picture_book",
  cover: {
    title: "The Things That Make Me, Me",
    subtitle: "A story about discovering what makes you special",
    imagePrompt: "A confident child standing in front of a mirror, seeing different versions of themselves being brave, creative, and kind",
  },
  pages: [
    {
      id: "p-1",
      text: "My name is [Name], and there is nobody else in the whole world exactly like me.",
      imagePrompt: "A child standing proudly in the center of a colourful world, unique patterns radiating from them",
    },
    {
      id: "p-2",
      text: "Sometimes I'm really good at things. And sometimes I make mistakes. Both of those are okay.",
      imagePrompt: "Split scene: child painting a masterpiece on one side, and spilling paint on the other — smiling in both",
    },
    {
      id: "p-3",
      text: "I'm a good friend because I listen and I care about how other people feel.",
      imagePrompt: "A child sitting with a sad friend, putting a comforting hand on their shoulder",
    },
    {
      id: "p-4",
      text: "When something is hard, I can try again. Trying is what makes me brave, not getting it perfect.",
      imagePrompt: "A child climbing a gentle hill, looking determined, with a flag at the top saying 'I tried!'",
    },
    {
      id: "p-5",
      text: "The things that make me different are the things that make me special.",
      imagePrompt: "A diverse group of children, each shown with unique talents and qualities glowing around them",
    },
  ],
};

// --- Behavior Charts ---

const morningRoutineStickerChart: BehaviorChartContent = {
  chartFormat: "sticker_chart",
  title: "My Morning Routine Stars",
  instructions: "Each time you complete a morning task, place a sticker in the box. Fill the whole week to earn your reward!",
  behaviors: [
    { id: "b1", name: "Brush teeth", description: "Brush for two full minutes", imagePrompt: "A cheerful cartoon toothbrush with sparkles and a big smile", imageAssetKey: "chart_behavior_icon:behavior_0" },
    { id: "b2", name: "Get dressed", description: "Choose and put on clothes by yourself", imagePrompt: "A bright, colorful t-shirt and shorts neatly folded with a happy face", imageAssetKey: "chart_behavior_icon:behavior_1" },
    { id: "b3", name: "Eat breakfast", description: "Sit and eat your breakfast calmly", imagePrompt: "A warm bowl of cereal with a spoon and a glass of juice, friendly style", imageAssetKey: "chart_behavior_icon:behavior_2" },
    { id: "b4", name: "Pack bag", description: "Put everything you need in your school bag", imagePrompt: "A colourful school backpack with a star on it, ready to go", imageAssetKey: "chart_behavior_icon:behavior_3" },
  ],
  reward: { name: "Extra 15 minutes of play", description: "Choose any game or activity for bonus playtime", imagePrompt: "A joyful child playing with toys surrounded by colourful stars and confetti", imageAssetKey: "chart_reward" },
  columns: 5,
  columnLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  headerImagePrompt: "A bright, cheerful sunrise over a cosy house with a smiling sun, warm colours, child-friendly illustration",
  headerImageAssetKey: "chart_header",
};

const calmBodyTokenBoard: BehaviorChartContent = {
  chartFormat: "token_board",
  title: "My Calm Body Tokens",
  instructions: "Each time you use a calm body skill, you earn a star token. Fill all the stars to earn your reward!",
  behaviors: [
    { id: "b1", name: "Deep breaths", description: "Take 3 slow, deep belly breaths", imagePrompt: "A pair of lungs with gentle wind swirls, peaceful and calming style", imageAssetKey: "chart_behavior_icon:behavior_0" },
    { id: "b2", name: "Quiet hands", description: "Keep hands still and gentle", imagePrompt: "Two open hands resting quietly with a soft glow around them", imageAssetKey: "chart_behavior_icon:behavior_1" },
    { id: "b3", name: "Walking feet", description: "Walk calmly instead of running", imagePrompt: "A pair of friendly sneakers walking gently on a path with flowers", imageAssetKey: "chart_behavior_icon:behavior_2" },
  ],
  reward: { name: "Choose a sticker", description: "Pick any sticker from the treasure box", imagePrompt: "A treasure chest overflowing with colourful stickers and stars", imageAssetKey: "chart_reward" },
  totalSlots: 8,
  tokenName: "star",
  tokenImagePrompt: "A bright golden star with a warm glow and gentle sparkle, simple icon style",
  tokenImageAssetKey: "chart_token",
  headerImagePrompt: "A peaceful meadow scene with soft clouds, butterflies, and a gentle rainbow, child-friendly illustration",
  headerImageAssetKey: "chart_header",
};

const kindnessProgressTracker: BehaviorChartContent = {
  chartFormat: "progress_tracker",
  title: "Kindness Quest",
  instructions: "Complete acts of kindness to level up! Check off each level when you reach its milestone.",
  behaviors: [
    { id: "b1", name: "Share with others", description: "Share a toy, snack, or idea with someone", imagePrompt: "Two hands exchanging a heart-shaped gift, warm and friendly style", imageAssetKey: "chart_behavior_icon:behavior_0" },
    { id: "b2", name: "Use kind words", description: "Say something nice to someone", imagePrompt: "A speech bubble with a smiley face and hearts floating out", imageAssetKey: "chart_behavior_icon:behavior_1" },
    { id: "b3", name: "Help someone", description: "Offer to help without being asked", imagePrompt: "A child helping another child pick up dropped books, warm illustration", imageAssetKey: "chart_behavior_icon:behavior_2" },
  ],
  reward: { name: "Kindness Champion Badge", description: "You are an official Kindness Champion!", imagePrompt: "A shiny gold badge with a heart in the center and the word Champion on a ribbon", imageAssetKey: "chart_reward" },
  levels: [
    { id: "l1", name: "Kindness Starter", milestone: "Complete 3 kind acts" },
    { id: "l2", name: "Kindness Helper", milestone: "Complete 6 kind acts across at least 2 types" },
    { id: "l3", name: "Kindness Hero", milestone: "Complete 10 kind acts and help someone new" },
    { id: "l4", name: "Kindness Champion", milestone: "Complete 15 kind acts — you're a true champion!" },
  ],
  headerImagePrompt: "A winding path through a magical garden with stepping stones, flowers, and a castle in the distance, warm and inviting illustration",
  headerImageAssetKey: "chart_header",
};

// --- Visual Schedules ---

const morningRoutineStrip: VisualScheduleContent = {
  scheduleFormat: "routine_strip",
  title: "My Morning Routine",
  instructions: "Follow the steps from left to right. Put a sticker on each one when you're done!",
  activities: [
    { id: "a1", name: "Wake Up", description: "Open your eyes and stretch", imagePrompt: "A cheerful child stretching and yawning in bed with morning sunlight coming through the window, simple icon-style illustration" },
    { id: "a2", name: "Brush Teeth", description: "2 minutes of brushing", imagePrompt: "A happy toothbrush with sparkles and a tube of toothpaste, simple icon-style illustration" },
    { id: "a3", name: "Get Dressed", description: "Pick your clothes and put them on", imagePrompt: "A neatly folded stack of colorful children's clothes with a small hanger, simple icon-style illustration" },
    { id: "a4", name: "Eat Breakfast", description: "Sit at the table and eat", imagePrompt: "A bowl of cereal with a glass of juice on a cheerful placemat, simple icon-style illustration" },
    { id: "a5", name: "Pack Bag", description: "Put everything you need in your bag", imagePrompt: "A colorful school backpack with books and a lunchbox peeking out, simple icon-style illustration" },
    { id: "a6", name: "Shoes On", description: "Put on your shoes by the door", imagePrompt: "A pair of bright children's sneakers ready by the front door, simple icon-style illustration" },
  ],
  headerImagePrompt: "A bright, cheerful sunrise scene with a cozy house and a path leading to school, warm morning colors, simple illustration",
  headerImageAssetKey: "schedule_header",
};

const therapySessionBoard: VisualScheduleContent = {
  scheduleFormat: "schedule_board",
  title: "Our Therapy Session",
  instructions: "We'll work through each activity together. Tick each box when we finish.",
  timeLabels: true,
  checkboxes: true,
  activities: [
    { id: "a1", name: "Check In", description: "How are you feeling today?", time: "10:00", duration: "5 min", imagePrompt: "A friendly waving hand with a speech bubble containing a smiley face, simple icon illustration" },
    { id: "a2", name: "Talk Time", description: "Share what's on your mind", time: "10:05", duration: "10 min", imagePrompt: "Two chairs facing each other with a warm lamp nearby, simple icon illustration" },
    { id: "a3", name: "Activity", description: "Today's fun activity", time: "10:15", duration: "15 min", imagePrompt: "Art supplies including crayons, paper, and scissors arranged neatly, simple icon illustration" },
    { id: "a4", name: "Break", description: "Stretch and have some water", time: "10:30", duration: "5 min", imagePrompt: "A glass of water with a small plant and a stretching figure, simple icon illustration" },
    { id: "a5", name: "Practice", description: "Try our new skill", time: "10:35", duration: "10 min", imagePrompt: "A lightbulb with a star badge showing a thumbs up, simple icon illustration" },
    { id: "a6", name: "Wrap Up", description: "Review what we learned and say goodbye", time: "10:45", duration: "5 min", imagePrompt: "A calendar with a checkmark and a small gift box, simple icon illustration" },
  ],
  headerImagePrompt: "A welcoming therapy room with comfortable chairs, soft cushions, and warm lighting, calming illustration",
  headerImageAssetKey: "schedule_header",
};

const firstThenTransition: VisualScheduleContent = {
  scheduleFormat: "first_then",
  title: "First-Then Board",
  instructions: "First we do the task, then we earn the reward!",
  firstLabel: "First",
  thenLabel: "Then",
  activities: [
    { id: "a1", name: "Tidy Up", description: "Put the toys back in the box", imagePrompt: "A toy box with colorful toys being placed inside by small hands, cheerful icon illustration" },
    { id: "a2", name: "Playtime!", description: "Free play with your favourite toys", imagePrompt: "A happy child playing with building blocks and stuffed animals, cheerful icon illustration" },
  ],
  headerImagePrompt: "A bright and encouraging banner with stars and a rainbow, motivational illustration for children",
  headerImageAssetKey: "schedule_header",
};

// --- Assemble all templates ---

export const STARTER_TEMPLATES: StarterTemplate[] = [
  // Emotion Cards
  {
    id: "anxiety-emotion-cards",
    type: "emotion_cards",
    name: "Anxiety Feelings Deck",
    description: "Eight emotion cards focused on anxiety-related feelings, from worried to relieved. Helps children identify and name their anxious emotions.",
    theme: "anxiety",
    contentSummary: "8 emotion cards",
    content: anxietyEmotionCards as unknown as Record<string, unknown>,
  },
  {
    id: "primary-emotion-cards",
    type: "emotion_cards",
    name: "Primary Emotions Deck",
    description: "Eight core emotions every child should learn to recognise. A foundational set for emotional literacy work.",
    theme: "emotions",
    contentSummary: "8 emotion cards",
    content: primaryEmotionCards as unknown as Record<string, unknown>,
  },

  // Flashcards
  {
    id: "anxiety-coping-flashcards",
    type: "flashcards",
    name: "Anxiety Coping Cards",
    description: "Practical coping strategies for anxious moments. Each card teaches a different grounding or calming technique.",
    theme: "anxiety",
    contentSummary: "8 coping strategy cards",
    content: anxietyFlashcards as unknown as Record<string, unknown>,
  },
  {
    id: "social-skills-flashcards",
    type: "flashcards",
    name: "Social Skills Cards",
    description: "Key social skills broken into simple steps. Great for role-play practice and social skills groups.",
    theme: "social-skills",
    contentSummary: "6 social skill cards",
    content: socialSkillsFlashcards as unknown as Record<string, unknown>,
  },
  {
    id: "anger-management-flashcards",
    type: "flashcards",
    name: "Anger Management Cards",
    description: "Tools and techniques for managing anger safely. Includes the Anger Thermometer, Turtle Technique, and I-Statements.",
    theme: "anger",
    contentSummary: "6 anger management cards",
    content: angerFlashcards as unknown as Record<string, unknown>,
  },

  // Worksheets
  {
    id: "cbt-thought-detective",
    type: "worksheet",
    name: "Thought Detective Worksheet",
    description: "A CBT-based worksheet guiding children through identifying, challenging, and reframing unhelpful thoughts.",
    theme: "cbt",
    contentSummary: "Prompts, scales & checklists",
    content: cbtThoughtWorksheet as unknown as Record<string, unknown>,
  },
  {
    id: "my-strengths-star",
    type: "worksheet",
    name: "My Strengths Star",
    description: "A self-esteem building worksheet helping children identify their strengths, recall brave moments, and draw themselves as superheroes.",
    theme: "self-esteem",
    contentSummary: "Prompts, scales & drawing",
    content: selfEsteemWorksheet as unknown as Record<string, unknown>,
  },
  {
    id: "mindful-moment-worksheet",
    type: "worksheet",
    name: "My Mindful Moment",
    description: "A grounding worksheet that guides children through noticing their senses, body, and surroundings in the present moment.",
    theme: "mindfulness",
    contentSummary: "Senses, body check & drawing",
    content: mindfulnessWorksheet as unknown as Record<string, unknown>,
  },

  // Posters
  {
    id: "anxiety-coping-poster",
    type: "poster",
    name: "When I Feel Worried...",
    description: "A reassuring poster with coping reminders for anxious moments. Perfect for classroom walls or therapy rooms.",
    theme: "anxiety",
    contentSummary: "Illustrated poster",
    content: anxietyPoster as unknown as Record<string, unknown>,
  },
  {
    id: "anger-cooldown-poster",
    type: "poster",
    name: "My Cool-Down Plan",
    description: "A visual reminder of anger management steps. Helps children remember their cool-down strategies in the moment.",
    theme: "anger",
    contentSummary: "Illustrated poster",
    content: angerPoster as unknown as Record<string, unknown>,
  },

  // Board Games
  {
    id: "emotions-board-game",
    type: "board_game",
    name: "Feelings Adventure",
    description: "A 36-space board game with emotion check-ins, act-it-out challenges, and calming activities. Great for group therapy sessions.",
    theme: "emotions",
    contentSummary: "36 spaces · 4 tokens · 8 cards",
    content: emotionsBoardGame as unknown as Record<string, unknown>,
  },

  // Card Games
  {
    id: "strengths-powers-card-game",
    type: "card_game",
    name: "Strengths & Powers",
    description: "A therapeutic card game encouraging children to explore their strengths, face challenges, and practise kindness. Ideal for self-esteem work.",
    theme: "self-esteem",
    contentSummary: "8 cards · 3 categories",
    content: selfEsteemCardGame as unknown as Record<string, unknown>,
  },

  // Books
  {
    id: "worry-monster-book",
    type: "book",
    name: "When My Worry Monster Visits",
    description: "A gentle social story about learning to manage anxiety. Follows a child who discovers breathing can shrink their worry monster.",
    theme: "anxiety",
    contentSummary: "6-page picture book",
    content: anxietySocialStory as unknown as Record<string, unknown>,
  },
  {
    id: "self-esteem-book",
    type: "book",
    name: "The Things That Make Me, Me",
    description: "A social story celebrating individuality and building self-worth. Helps children recognise their unique strengths and qualities.",
    theme: "self-esteem",
    contentSummary: "5-page picture book",
    content: selfEsteemBook as unknown as Record<string, unknown>,
  },

  // Behavior Charts
  {
    id: "morning-routine-sticker-chart",
    type: "behavior_chart",
    name: "Morning Routine Stars",
    description: "A sticker chart tracking 4 morning routine behaviors across 5 weekdays. Earns a special reward at the end of the week.",
    theme: "social-skills",
    contentSummary: "Sticker chart · 4 behaviors · 5 days",
    content: morningRoutineStickerChart as unknown as Record<string, unknown>,
  },
  {
    id: "calm-body-token-board",
    type: "behavior_chart",
    name: "Calm Body Token Board",
    description: "A token board for practising calm body skills. Collect 8 star tokens to earn a reward.",
    theme: "anxiety",
    contentSummary: "Token board · 3 behaviors · 8 tokens",
    content: calmBodyTokenBoard as unknown as Record<string, unknown>,
  },
  {
    id: "kindness-progress-tracker",
    type: "behavior_chart",
    name: "Kindness Quest",
    description: "A progress tracker with 4 levels of kindness milestones. Encourages social skills through achievable goals.",
    theme: "social-skills",
    contentSummary: "Progress tracker · 3 behaviors · 4 levels",
    content: kindnessProgressTracker as unknown as Record<string, unknown>,
  },

  // Visual Schedules
  {
    id: "morning-routine-strip",
    type: "visual_schedule",
    name: "Morning Routine",
    description: "A horizontal routine strip with 6 morning activities from wake up to shoes on. Great for ASD and ADHD morning structure.",
    theme: "social-skills",
    contentSummary: "Routine strip · 6 activities",
    content: morningRoutineStrip as unknown as Record<string, unknown>,
  },
  {
    id: "therapy-session-schedule",
    type: "visual_schedule",
    name: "Therapy Session Schedule",
    description: "A schedule board with timed activities for a 50-minute therapy session. Helps children anticipate what comes next.",
    theme: "mindfulness",
    contentSummary: "Schedule board · 6 activities",
    content: therapySessionBoard as unknown as Record<string, unknown>,
  },
  {
    id: "first-then-transition",
    type: "visual_schedule",
    name: "First-Then Transition Board",
    description: "A simple two-panel board for transitions and motivation. First complete the task, then earn the reward.",
    theme: "social-skills",
    contentSummary: "First-Then · 2 activities",
    content: firstThenTransition as unknown as Record<string, unknown>,
  },
];
