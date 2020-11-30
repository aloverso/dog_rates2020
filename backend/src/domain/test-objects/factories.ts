import dayjs from "dayjs";
import { ComparisonPair, ComparisonSelection, Tweet, TweetResponse } from "../types";

export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const generateTweet = (overrides: Partial<Tweet>): Tweet => {
  return {
    id: "some-id-" + randomInt(),
    content: "This is doggo-" + randomInt(),
    date: dayjs().toISOString(),
    imageUrls: ["some-url-" + randomInt()],
    compareCount: randomInt(),
    selectedCount: randomInt(),
    lastCompared: dayjs().toISOString(),
    ...overrides,
  };
};

export const generateTweetResponse = (overrides: Partial<TweetResponse>): TweetResponse => {
  return {
    id: "some-id-" + randomInt(),
    content: "This is doggo-" + randomInt(),
    date: dayjs().toISOString(),
    imageUrls: ["some-url-" + randomInt()],
    ...overrides,
  };
};

export const generateComparisonPair = (overrides: Partial<ComparisonPair>): ComparisonPair => {
  return {
    tweet1: generateTweetResponse({}),
    tweet2: generateTweetResponse({}),
    ...overrides,
  };
};

export const generateComparisonSelection = (overrides: Partial<ComparisonSelection>): ComparisonSelection => {
  const tweet1Id = "some-id-" + randomInt();
  const tweet2Id = "some-id-" + randomInt();
  return {
    tweet1Id,
    tweet2Id,
    selection: randomFromList([tweet1Id, tweet2Id]),
    ...overrides,
  };
};

export const randomFromList = <T>(list: T[]): T => {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};
