export interface TweetResponse {
  id: string;
  content: string;
  date: string;
  imageUrls: string[];
}

export interface ComparisonPair {
  tweet1: TweetResponse;
  tweet2: TweetResponse;
  token: string;
}

export interface ComparisonSelection {
  tweet1Id: string;
  tweet2Id: string;
  selection: string;
  token: string;
}
