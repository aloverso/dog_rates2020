import { GetComparisonPair } from "../types";
import { getComparisonPairFactory } from "./getComparisonPair";
import { generateTweet } from "../test-objects/factories";

describe("getComparisonPair", () => {
  let mockGetRandom: jest.Mock;
  let mockGetAllTweets: jest.Mock;
  let getComparisonPair: GetComparisonPair;

  beforeEach(() => {
    mockGetRandom = jest.fn();
    mockGetAllTweets = jest.fn();
    getComparisonPair = getComparisonPairFactory(mockGetRandom, mockGetAllTweets);
  });

  it("picks two tweets from the list using the random generator", async () => {
    const tweet0 = generateTweet({});
    const tweet1 = generateTweet({});
    const tweet2 = generateTweet({});

    mockGetAllTweets.mockResolvedValue([tweet0, tweet1, tweet2]);
    mockGetRandom.mockResolvedValue([2, 0]);
    const pair = await getComparisonPair();
    expect(pair.tweet1).toEqual({
      id: tweet2.id,
      date: tweet2.date,
      content: tweet2.content,
      imageUrls: tweet2.imageUrls,
    });
    expect(pair.tweet2).toEqual({
      id: tweet0.id,
      date: tweet0.date,
      content: tweet0.content,
      imageUrls: tweet0.imageUrls,
    });

    expect(mockGetAllTweets).toHaveBeenCalledTimes(1);
    expect(mockGetRandom).toHaveBeenCalledTimes(1);
  });

  it("caches all tweets and does not fetch twice", async () => {
    mockGetAllTweets.mockResolvedValue([generateTweet({}), generateTweet({})]);
    mockGetRandom.mockResolvedValue([1, 0]);
    await getComparisonPair();
    await getComparisonPair();
    expect(mockGetAllTweets).toHaveBeenCalledTimes(1);
    expect(mockGetRandom).toHaveBeenCalledTimes(2);
  });

  it("regenerates random numbers until they are different", async () => {
    const tweet0 = generateTweet({});
    const tweet1 = generateTweet({});
    mockGetAllTweets.mockResolvedValue([tweet0, tweet1]);
    mockGetRandom.mockResolvedValueOnce([1, 1]).mockResolvedValueOnce([1, 1]).mockResolvedValueOnce([0, 1]);
    const pair = await getComparisonPair();
    expect(pair.tweet1.id).toEqual(tweet0.id);
    expect(pair.tweet2.id).toEqual(tweet1.id);
    expect(mockGetRandom).toHaveBeenCalledTimes(3);
  });
});
