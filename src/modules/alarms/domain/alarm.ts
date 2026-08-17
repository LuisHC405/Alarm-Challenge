export type ChallengeType = 'math' | 'programming';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type AlarmRecord = {
  id: string;
  name: string;
  time: string;
  challengeType: ChallengeType;
  difficulty: Difficulty;
  enabled: boolean;
  weekdays: Weekday[];
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AlarmInput = {
  name?: string;
  time: string;
  challengeType?: ChallengeType;
  difficulty?: Difficulty;
  enabled?: boolean;
  weekdays?: Weekday[];
  scheduledDate?: string | null;
};
