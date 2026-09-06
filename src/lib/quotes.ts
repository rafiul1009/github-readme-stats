export type QuoteCategory = "programming" | "motivational" | "humor";

export interface Quote {
  text: string;
  author: string;
  category: QuoteCategory;
}

/**
 * Bundled quote set (docs/TODOS.md 9.3) — deliberately not fetched from an
 * external API, so this widget has no network dependency, no rate limit,
 * and never breaks because a third-party quote service is down. Widely
 * circulated, commonly-attributed quotes (the same kind of set most
 * "programming quotes" README widgets in this ecosystem bundle); not full
 * copyrighted works.
 */
export const QUOTES: Quote[] = [
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", category: "programming" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "programming" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "programming" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "programming" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "programming" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs", category: "programming" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "programming" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "programming" },
  { text: "It's not a bug — it's an undocumented feature.", author: "Anonymous", category: "programming" },
  { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton", category: "programming" },
  { text: "Weeks of coding can save you hours of planning.", author: "Anonymous", category: "programming" },
  { text: "The only way to go fast is to go well.", author: "Robert C. Martin", category: "programming" },
  { text: "Deleted code is debugged code.", author: "Jeff Sickel", category: "programming" },
  { text: "Premature optimization is the root of all evil.", author: "Donald Knuth", category: "programming" },
  { text: "Testing leads to failure, and failure leads to understanding.", author: "Burt Rutan", category: "programming" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "motivational" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivational" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "motivational" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivational" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "motivational" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser", category: "motivational" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg", category: "motivational" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Anonymous", category: "motivational" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "motivational" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "motivational" },
  { text: "A user interface is like a joke. If you have to explain it, it's not that good.", author: "Anonymous", category: "humor" },
  { text: "99 little bugs in the code. 99 little bugs. Take one down, patch it around. 127 little bugs in the code.", author: "Anonymous", category: "humor" },
  { text: "I don't always test my code, but when I do, I do it in production.", author: "Anonymous", category: "humor" },
  { text: "There are two ways to write error-free programs; only the third one works.", author: "Alan J. Perlis", category: "humor" },
  { text: "Real programmers count from 0.", author: "Anonymous", category: "humor" },
  { text: "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'", author: "Anonymous", category: "humor" },
  { text: "It works on my machine.", author: "Every developer, ever", category: "humor" },
  { text: "To err is human, to really foul things up requires a computer.", author: "Anonymous", category: "humor" },
];

export function getQuotesByCategory(category?: QuoteCategory): Quote[] {
  if (!category) return QUOTES;
  return QUOTES.filter((q) => q.category === category);
}

export function pickRandomQuote(category?: QuoteCategory): Quote {
  const pool = getQuotesByCategory(category);
  const source = pool.length > 0 ? pool : QUOTES;
  return source[Math.floor(Math.random() * source.length)];
}
