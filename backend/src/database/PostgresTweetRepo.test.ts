import { TweetRepo } from "../domain/types";
import { generateTweet } from "../domain/test-objects/factories";
import { PostgresTweetRepo } from "./PostgresTweetRepo";

describe("PostgresTweetRepo", () => {
  let tweetRepo: TweetRepo;

  beforeAll(async () => {
    const connection = {
      user: "postgres",
      host: "localhost",
      database: "dogratestest",
      password: "",
      port: 5432,
    };
    tweetRepo = PostgresTweetRepo(connection);
  });

  it("gets all saved tweets", async () => {
    const tweet1 = generateTweet({});
    const tweet2 = generateTweet({});
    await tweetRepo.save(tweet1);
    await tweetRepo.save(tweet2);

    const tweets = await tweetRepo.findAll();
    expect(tweets.length).toEqual(2);
    expect(tweets[0]).toEqual(tweet1);
    expect(tweets[1]).toEqual(tweet2);
  });

  it("finds a tweet by id", async () => {
    const tweet = generateTweet({});
    await tweetRepo.save(tweet);

    const foundTweet = await tweetRepo.findById(tweet.id);
    expect(foundTweet).toEqual(tweet);
  });

  it("updates a tweet", async () => {
    const tweet = generateTweet({ compareCount: 2 });
    await tweetRepo.save(tweet);

    await tweetRepo.update({ id: tweet.id, compareCount: 700 });

    const foundTweet = await tweetRepo.findById(tweet.id);
    expect(foundTweet.compareCount).toEqual(700);
  });

  afterAll(async () => {
    await tweetRepo.disconnect();
  });
});
