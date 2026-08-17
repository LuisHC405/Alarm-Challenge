export type ChallengeType = 'math' | 'programming';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type AlarmRecord = {
  id: string;
  name: string;
  time: string;
  challengeType: ChallengeType;
  difficulty: Difficulty;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AlarmInput = {
  name?: string;
  time: string;
  challengeType?: ChallengeType;
  difficulty?: Difficulty;
  enabled?: boolean;
};
