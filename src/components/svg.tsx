// import { CSSProperties } from 'react';

interface ThemeColors {
  background: string;
  text: string;
  border: string;
  streak: string;
}

const themes: Record<string, ThemeColors> = {
  light: {
    background: '#ffffff',
    text: '#333333',
    border: '#e4e2e2',
    streak: '#4c71f2'
  },
  dark: {
    background: '#0d1117',
    text: '#c9d1d9',
    border: '#30363d',
    streak: '#58a6ff'
  }
};

interface StreakCardProps {
  username: string;
  currentStreak: number;
  lastContributionDate: string;
  theme?: 'light' | 'dark';
  font?: string;
}

export function generateStreakCard({
  username,
  currentStreak,
  lastContributionDate,
  theme = 'light',
  font = 'Inter'
}: StreakCardProps): string {
  const colors = themes[theme];
  const formattedDate = new Date(lastContributionDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // const styles: Record<string, CSSProperties> = {
  //   card: {
  //     width: '495px',
  //     height: '195px',
  //     backgroundColor: colors.background,
  //     border: `1px solid ${colors.border}`,
  //     borderRadius: '6px',
  //     padding: '20px',
  //     fontFamily: font
  //   },
  //   header: {
  //     color: colors.text,
  //     fontSize: '20px',
  //     fontWeight: 600,
  //     textAlign: 'center',
  //     marginBottom: '10px'
  //   },
  //   streak: {
  //     color: colors.streak,
  //     fontSize: '28px',
  //     fontWeight: 700,
  //     textAlign: 'center'
  //   },
  //   date: {
  //     color: colors.text,
  //     fontSize: '14px',
  //     textAlign: 'center',
  //     marginTop: '5px'
  //   }
  // };

  return `
    <svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .header { font: 600 20px ${font}; fill: ${colors.text}; }
        .streak { font: 700 28px ${font}; fill: ${colors.streak}; }
        .date { font: 400 14px ${font}; fill: ${colors.text}; }
      </style>
      
      <rect width="495" height="195" fill="${colors.background}" rx="6" />
      <rect x="0.5" y="0.5" width="494" height="194" rx="5.5" stroke="${colors.border}" />
      
      <text x="247.5" y="50" text-anchor="middle" class="header">
        ${username}'s Contribution Streak
      </text>
      
      <text x="247.5" y="100" text-anchor="middle" class="streak">
        ${currentStreak} days
      </text>
      
      <text x="247.5" y="140" text-anchor="middle" class="date">
        Last Contribution: ${formattedDate}
      </text>
    </svg>
  `;
}