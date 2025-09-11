// Narzędzia do porównywania progresu i określania kolorów
export const compareValues = (current, previous, type) => {
  if (previous === null || previous === undefined) return 'neutral';
  
  const currentNum = parseFloat(current);
  const previousNum = parseFloat(previous);
  
  if (isNaN(currentNum) || isNaN(previousNum)) return 'neutral';
  
  switch (type) {
    case 'reps':
    case 'weight':
      // Więcej powtórzeń/wagi = lepiej (zielony)
      return currentNum > previousNum ? 'positive' 
           : currentNum < previousNum ? 'negative' 
           : 'neutral';
    
    case 'duration':
      // Mniej czasu = lepiej (zielony)
      return currentNum < previousNum ? 'positive' 
           : currentNum > previousNum ? 'negative' 
           : 'neutral';
    
    default:
      return 'neutral';
  }
};

export const getProgressColor = (comparison) => {
  switch (comparison) {
    case 'positive': return '#4caf50'; // Zielony - poprawa
    case 'negative': return '#f44336'; // Czerwony - pogorszenie
    default: return '#ffeb3b';         // Żółty - bez zmian
  }
};

export const getProgressEmoji = (comparison) => {
  switch (comparison) {
    case 'positive': return '🟢';
    case 'negative': return '🔴';
    default: return '🟡';
  }
};

// Funkcja do porównywania trudności na podstawie emoji
export const compareDifficulty = (current, previous) => {
  if (!previous) return 'neutral';
  
  const difficultyOrder = { '😩': 0, '😐': 1, '😊': 2 };
  const currentRank = difficultyOrder[current];
  const previousRank = difficultyOrder[previous];
  
  if (currentRank === undefined || previousRank === undefined) return 'neutral';
  
  return currentRank > previousRank ? 'positive' 
       : currentRank < previousRank ? 'negative' 
       : 'neutral';
};