export const motivationalQuotes = [
  {
    quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke"
  },
  {
    quote: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    quote: "I can accept failure, everyone fails at something. But I can't accept not trying.",
    author: "Michael Jordan"
  },
  {
    quote: "The difference between the impossible and the possible lies in a person's determination.",
    author: "Tommy Lasorda"
  },
  {
    quote: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi"
  },
  {
    quote: "The more difficult the victory, the greater the happiness in winning.",
    author: "Pelé"
  },
  {
    quote: "If you train hard, you'll not only be hard, you'll be hard to beat.",
    author: "Herschel Walker"
  },
  {
    quote: "Don't measure yourself by what you have accomplished, but by what you should have accomplished with your ability.",
    author: "John Wooden"
  },
  {
    quote: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
  },
  {
    quote: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon"
  },
  {
    quote: "The key is not the will to win. Everybody has that. It is the will to prepare to win that is important.",
    author: "Bobby Knight"
  },
  {
    quote: "It's not about perfect. It's about effort. And when you bring that effort every single day, that's where transformation happens.",
    author: "Jillian Michaels"
  },
  {
    quote: "Talent wins games, but teamwork and intelligence win championships.",
    author: "Michael Jordan"
  },
  {
    quote: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    quote: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    author: "William Butler Yeats"
  },
  {
    quote: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson"
  },
  {
    quote: "The harder the battle, the sweeter the victory.",
    author: "Les Brown"
  },
  {
    quote: "If you want to achieve greatness stop asking for permission.",
    author: "Anonymous"
  },
  {
    quote: "To give anything less than your best is to sacrifice the gift.",
    author: "Steve Prefontaine"
  },
  {
    quote: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Anonymous"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    quote: "Set your goals high, and don't stop till you get there.",
    author: "Bo Jackson"
  },
  {
    quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar"
  },
  {
    quote: "The will to win is important, but the will to prepare is vital.",
    author: "Joe Paterno"
  },
  {
    quote: "It's not the will to win that matters—everyone has that. It's the will to prepare to win that matters.",
    author: "Paul Bryant"
  },
  {
    quote: "Success isn't owned. It's leased, and rent is due every day.",
    author: "J.J. Watt"
  },
  {
    quote: "Some people want it to happen, some wish it would happen, others make it happen.",
    author: "Michael Jordan"
  }
];

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

export const getQuoteOfTheDay = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
};