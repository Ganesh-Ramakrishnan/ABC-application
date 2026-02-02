import { Injectable } from '@angular/core';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface DayStreak {
  date: string;
  practiced: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private badges: Badge[] = [
    { id: 'first-letter', name: 'First Steps', description: 'Trace your first letter!', icon: '🌟', unlocked: false },
    { id: 'five-letters', name: 'Learning Star', description: 'Complete 5 letters', icon: '⭐', unlocked: false },
    { id: 'ten-letters', name: 'ABC Champion', description: 'Complete 10 letters', icon: '🏆', unlocked: false },
    { id: 'all-uppercase', name: 'Capital Master', description: 'Complete all uppercase letters', icon: '🎖️', unlocked: false },
    { id: 'all-lowercase', name: 'Small Wonder', description: 'Complete all lowercase letters', icon: '🌈', unlocked: false },
    { id: 'perfect-trace', name: 'Perfect Artist', description: 'Get 3 stars on any letter', icon: '✨', unlocked: false },
    { id: 'three-day-streak', name: 'Consistent Learner', description: 'Practice 3 days in a row', icon: '🔥', unlocked: false },
    { id: 'week-streak', name: 'Weekly Warrior', description: 'Practice 7 days in a row', icon: '💪', unlocked: false },
    { id: 'all-complete', name: 'ABC Master', description: 'Complete everything!', icon: '👑', unlocked: false }
  ];

  private streaks: DayStreak[] = [];
  private currentStreak: number = 0;

  constructor() {
    this.loadProgress();
  }

  getBadges(): Badge[] {
    return this.badges;
  }

  getUnlockedBadges(): Badge[] {
    return this.badges.filter(b => b.unlocked);
  }

  unlockBadge(badgeId: string) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      badge.unlockedDate = new Date();
      this.saveProgress();
      return badge;
    }
    return null;
  }

  checkAndUnlockBadges(completedCount: number, allUppercaseComplete: boolean,
                       allLowercaseComplete: boolean, allComplete: boolean,
                       gotThreeStars: boolean) {
    const newBadges: Badge[] = [];

    if (completedCount >= 1) {
      const badge = this.unlockBadge('first-letter');
      if (badge) newBadges.push(badge);
    }

    if (completedCount >= 5) {
      const badge = this.unlockBadge('five-letters');
      if (badge) newBadges.push(badge);
    }

    if (completedCount >= 10) {
      const badge = this.unlockBadge('ten-letters');
      if (badge) newBadges.push(badge);
    }

    if (allUppercaseComplete) {
      const badge = this.unlockBadge('all-uppercase');
      if (badge) newBadges.push(badge);
    }

    if (allLowercaseComplete) {
      const badge = this.unlockBadge('all-lowercase');
      if (badge) newBadges.push(badge);
    }

    if (allComplete) {
      const badge = this.unlockBadge('all-complete');
      if (badge) newBadges.push(badge);
    }

    if (gotThreeStars) {
      const badge = this.unlockBadge('perfect-trace');
      if (badge) newBadges.push(badge);
    }

    return newBadges;
  }

  recordPracticeToday() {
    const today = new Date().toISOString().split('T')[0];
    const existingDay = this.streaks.find(s => s.date === today);

    if (!existingDay) {
      this.streaks.push({ date: today, practiced: true });
      this.calculateStreak();
      this.saveProgress();
    }
  }

  private calculateStreak() {
    if (this.streaks.length === 0) {
      this.currentStreak = 0;
      return;
    }

    this.streaks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < this.streaks.length; i++) {
      const streakDate = new Date(this.streaks[i].date);
      streakDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (streakDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    this.currentStreak = streak;

    if (streak >= 3) {
      this.unlockBadge('three-day-streak');
    }
    if (streak >= 7) {
      this.unlockBadge('week-streak');
    }
  }

  getCurrentStreak(): number {
    return this.currentStreak;
  }

  getStreakDays(): DayStreak[] {
    return this.streaks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private saveProgress() {
    localStorage.setItem('badges', JSON.stringify(this.badges));
    localStorage.setItem('streaks', JSON.stringify(this.streaks));
  }

  private loadProgress() {
    const savedBadges = localStorage.getItem('badges');
    if (savedBadges) {
      this.badges = JSON.parse(savedBadges);
    }

    const savedStreaks = localStorage.getItem('streaks');
    if (savedStreaks) {
      this.streaks = JSON.parse(savedStreaks);
      this.calculateStreak();
    }
  }

  resetProgress() {
    this.badges.forEach(b => {
      b.unlocked = false;
      b.unlockedDate = undefined;
    });
    this.streaks = [];
    this.currentStreak = 0;
    this.saveProgress();
  }
}
