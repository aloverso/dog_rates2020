import { ComparisonPair, FindAllTweets, GetComparisonPair, GetRandom, Tweet, TweetResponse } from "../types";

export const getComparisonPairFactory = (
  getRandom: GetRandom,
  findAllTweets: FindAllTweets
): GetComparisonPair => {
  let allTweets: Tweet[] = [];

  return async (): Promise<ComparisonPair> => {
    if (allTweets.length === 0) {
      allTweets = await findAllTweets();
    }

    let randomIndices = await getRandom(0, allTweets.length - 1, 2);

    while (randomIndices[0] === randomIndices[1]) {
      randomIndices = await getRandom(0, allTweets.length - 1, 2);
    }

    return {
      tweet1: mapTweetToResponse(allTweets[randomIndices[0]]),
      tweet2: mapTweetToResponse(allTweets[randomIndices[1]]),
    };
  };
};

const mapTweetToResponse = (tweet: Tweet): TweetResponse => ({
  id: tweet.id,
  content: tweet.content,
  date: tweet.date,
  imageUrls: tweet.imageUrls,
});
