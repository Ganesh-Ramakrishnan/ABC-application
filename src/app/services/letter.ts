import { Injectable } from '@angular/core';

export interface LetterData {
  letter: string;
  type: 'uppercase' | 'lowercase' | 'number';
  completed: boolean;
  stars: number;
}

@Injectable({
  providedIn: 'root',
})
export class LetterService {
  private letters: LetterData[] = [];

  constructor() {
    this.initializeLetters();
  }

  private initializeLetters() {
    // Uppercase letters
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    uppercase.forEach(letter => {
      this.letters.push({
        letter,
        type: 'uppercase',
        completed: false,
        stars: 0
      });
    });

    // Lowercase letters
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'.split('');
    lowercase.forEach(letter => {
      this.letters.push({
        letter,
        type: 'lowercase',
        completed: false,
        stars: 0
      });
    });

    // Numbers
    const numbers = '0123456789'.split('');
    numbers.forEach(number => {
      this.letters.push({
        letter: number,
        type: 'number',
        completed: false,
        stars: 0
      });
    });
  }

  getAllLetters(): LetterData[] {
    return this.letters;
  }

  getLettersByType(type: 'uppercase' | 'lowercase' | 'number'): LetterData[] {
    return this.letters.filter(l => l.type === type);
  }

  getLetterData(letter: string): LetterData | undefined {
    return this.letters.find(l => l.letter === letter);
  }

  updateLetterProgress(letter: string, stars: number) {
    const letterData = this.letters.find(l => l.letter === letter);
    if (letterData) {
      letterData.completed = true;
      letterData.stars = Math.max(letterData.stars, stars);
      this.saveProgress();
    }
  }

  private saveProgress() {
    localStorage.setItem('letterProgress', JSON.stringify(this.letters));
  }

  loadProgress() {
    const saved = localStorage.getItem('letterProgress');
    if (saved) {
      const savedLetters = JSON.parse(saved);
      savedLetters.forEach((saved: LetterData) => {
        const letter = this.letters.find(l => l.letter === saved.letter);
        if (letter) {
          letter.completed = saved.completed;
          letter.stars = saved.stars;
        }
      });
    }
  }

  getCompletionPercentage(): number {
    const completed = this.letters.filter(l => l.completed).length;
    return Math.round((completed / this.letters.length) * 100);
  }

  getTotalStars(): number {
    return this.letters.reduce((sum, l) => sum + l.stars, 0);
  }
}
