export type PopulateHistoricalTweets = (once?: string) => Promise<void>;
export type GetComparisonPair = () => Promise<ComparisonPair>;
export type GetRandom = (min: number, max: number, count: number) => Promise<number[]>;
export type AddComparison = (comparisonSelection: ComparisonSelection) => Promise<void>;

export type FindAllTweets = () => Promise<Tweet[]>;
export type FindTweetById = (id: string) => Promise<Tweet>;
export type UpdateTweet = (partialTweet: Partial<Tweet>) => Promise<Tweet>;

export type SaveToken = (token: string) => Promise<string>;

export interface TweetRepo {
  save: (tweet: Tweet) => Promise<Tweet>;
  findAll: FindAllTweets;
  findById: FindTweetById;
  update: UpdateTweet;
  disconnect: () => void;
}

export interface TokenRepo {
  save: SaveToken;
  tokenExists: (token: string) => Promise<boolean>;
  remove: (token: string) => Promise<boolean>;
  disconnect: () => void;
}

export interface TokenService {
  generate: (id1: string, id2: string) => Promise<string>;
  validate: (token: string, id1: string, id2: string) => Promise<boolean>;
}

export interface Tweet {
  id: string;
  content: string;
  date: string;
  imageUrls: string[];
  compareCount: number;
  selectedCount: number;
  lastCompared: string;
}

export interface TweetResponse {
  id: string;
  content: string;
  date: string;
  imageUrls: string[];
}

export interface ComparisonPair {
  tweet1: TweetResponse;
  tweet2: TweetResponse;
}

export interface ComparisonSelection {
  tweet1Id: string;
  tweet2Id: string;
  selection: string;
}
