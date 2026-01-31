// Mini-games for chat - trivia, riddles, word games

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

export interface Riddle {
  question: string;
  answer: string;
  hints: string[];
}

export interface WordGame {
  type: 'scramble' | 'guess';
  word: string;
  scrambled?: string;
  hint: string;
  category: string;
}

const triviaQuestions: TriviaQuestion[] = [
  { question: "What is the capital of Japan?", options: ["Seoul", "Tokyo", "Beijing", "Bangkok"], correctIndex: 1, category: "Geography" },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"], correctIndex: 2, category: "Art" },
  { question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], correctIndex: 1, category: "Science" },
  { question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], correctIndex: 2, category: "History" },
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correctIndex: 2, category: "Science" },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], correctIndex: 1, category: "Science" },
  { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correctIndex: 1, category: "Geography" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctIndex: 1, category: "Literature" },
  { question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], correctIndex: 2, category: "Science" },
  { question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctIndex: 3, category: "Geography" },
  { question: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], correctIndex: 2, category: "Technology" },
  { question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Lime", "Onion"], correctIndex: 1, category: "Food" },
  { question: "Who discovered penicillin?", options: ["Marie Curie", "Louis Pasteur", "Alexander Fleming", "Isaac Newton"], correctIndex: 2, category: "Science" },
  { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctIndex: 2, category: "Geography" },
  { question: "How many bones are in the adult human body?", options: ["196", "206", "216", "226"], correctIndex: 1, category: "Science" },
];

const riddles: Riddle[] = [
  { question: "I have hands but can't clap. What am I?", answer: "clock", hints: ["I hang on walls", "I tell time"] },
  { question: "The more you take, the more you leave behind. What am I?", answer: "footsteps", hints: ["Walking creates me", "I'm on the ground"] },
  { question: "I speak without a mouth and hear without ears. What am I?", answer: "echo", hints: ["You hear me in mountains", "I repeat what you say"] },
  { question: "I have cities, but no houses. Mountains, but no trees. Water, but no fish. What am I?", answer: "map", hints: ["You can fold me", "I help you navigate"] },
  { question: "What has keys but no locks?", answer: "keyboard", hints: ["You type on me", "I'm used with computers"] },
  { question: "I'm tall when I'm young and short when I'm old. What am I?", answer: "candle", hints: ["I give light", "I'm made of wax"] },
  { question: "What can travel around the world while staying in a corner?", answer: "stamp", hints: ["I go on mail", "I'm usually paper"] },
  { question: "What has a head and a tail but no body?", answer: "coin", hints: ["I'm metal", "You flip me"] },
  { question: "What gets wetter the more it dries?", answer: "towel", hints: ["It's in your bathroom", "You use it after a shower"] },
  { question: "What has many teeth but can't bite?", answer: "comb", hints: ["It's for your hair", "It's usually plastic"] },
];

const wordGames: WordGame[] = [
  { type: 'scramble', word: 'COMPUTER', scrambled: 'OMUPRECT', hint: 'Electronic device', category: 'Technology' },
  { type: 'scramble', word: 'ELEPHANT', scrambled: 'TEPHANEL', hint: 'Large animal with trunk', category: 'Animals' },
  { type: 'scramble', word: 'RAINBOW', scrambled: 'WONIBAR', hint: 'Colorful arc in sky', category: 'Nature' },
  { type: 'scramble', word: 'MOUNTAIN', scrambled: 'NIATOMUN', hint: 'Very tall landform', category: 'Geography' },
  { type: 'scramble', word: 'GUITAR', scrambled: 'RATIGU', hint: 'String instrument', category: 'Music' },
  { type: 'scramble', word: 'CHOCOLATE', scrambled: 'CAHOTOLEC', hint: 'Sweet treat from cacao', category: 'Food' },
  { type: 'scramble', word: 'BUTTERFLY', scrambled: 'TYLBUFRET', hint: 'Colorful flying insect', category: 'Animals' },
  { type: 'scramble', word: 'ADVENTURE', scrambled: 'EDNUAVRET', hint: 'Exciting experience', category: 'Words' },
];

export function getRandomTrivia(): TriviaQuestion {
  return triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
}

export function getRandomRiddle(): Riddle {
  return riddles[Math.floor(Math.random() * riddles.length)];
}

export function getRandomWordGame(): WordGame {
  return wordGames[Math.floor(Math.random() * wordGames.length)];
}

export function formatTriviaQuestion(q: TriviaQuestion): string {
  const options = q.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n');
  return `**Trivia Time!** (${q.category})\n\n${q.question}\n\n${options}\n\nReply with just the letter (A, B, C, or D)!`;
}

export function formatRiddle(r: Riddle): string {
  return `**Riddle Time!**\n\n${r.question}\n\nThink carefully and reply with your answer!`;
}

export function formatWordGame(w: WordGame): string {
  return `**Word Scramble!** (${w.category})\n\nUnscramble this word: **${w.scrambled}**\n\nHint: ${w.hint}\n\nReply with the correct word!`;
}

export function checkTriviaAnswer(answer: string, correctIndex: number): boolean {
  const letter = answer.trim().toUpperCase().charAt(0);
  const answerIndex = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
  return answerIndex === correctIndex;
}

export function checkRiddleAnswer(answer: string, correctAnswer: string): boolean {
  return answer.toLowerCase().trim().includes(correctAnswer.toLowerCase());
}

export function checkWordAnswer(answer: string, correctWord: string): boolean {
  return answer.toLowerCase().trim() === correctWord.toLowerCase();
}

// Active games storage (in-memory for now)
const activeGames = new Map<string, { type: 'trivia' | 'riddle' | 'word'; data: any }>();

export function setActiveGame(userId: string, type: 'trivia' | 'riddle' | 'word', data: any) {
  activeGames.set(userId, { type, data });
}

export function getActiveGame(userId: string) {
  return activeGames.get(userId);
}

export function clearActiveGame(userId: string) {
  activeGames.delete(userId);
}
