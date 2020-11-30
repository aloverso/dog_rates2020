import { populateHistoricalTweetsFactory } from "./populateHistoricalTweets";
import dayjs = require("dayjs");
import axios from "axios";
import { PopulateHistoricalTweets } from "./types";
import { generateTweet } from "./test-objects/factories";
import twitterResponseFixture from "./twitterResponseFixture.json";
import { StubTweetRepo } from "./test-objects/StubTweetRepo";

jest.mock("axios");

describe("populateHistoricalTweets", () => {
  let populateHistoricalTweets: PopulateHistoricalTweets;
  let tweetRepo: StubTweetRepo;
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios = axios as jest.Mocked<typeof axios>;
    tweetRepo = StubTweetRepo();
    populateHistoricalTweets = populateHistoricalTweetsFactory(tweetRepo, "www.twitter.com", "auth-token");
  });

  it("uses oldest tweet id in request if exists", async () => {
    const olderTweet = generateTweet({ date: dayjs("2020-01-01").toISOString() });
    const newerTweet = generateTweet({ date: dayjs("2020-06-06").toISOString() });
    const middleTweet = generateTweet({ date: dayjs("2020-03-03").toISOString() });
    tweetRepo.findAll.mockResolvedValue([olderTweet, newerTweet, middleTweet]);
    mockedAxios.get.mockResolvedValue({ data: [] });
    await populateHistoricalTweets("once");
    expect(
      mockedAxios.get
    ).toHaveBeenCalledWith(
      `www.twitter.com/1.1/statuses/user_timeline.json?screen_name=dog_rates&count=200&exclude_replies=true&trim_user=true&tweet_mode=extended&max_id=${olderTweet.id}`,
      { headers: { Authorization: "Bearer auth-token" } }
    );
  });

  it("sends no max_id param if no tweets exist", async () => {
    tweetRepo.findAll.mockResolvedValue([]);
    mockedAxios.get.mockResolvedValue({ data: [] });
    await populateHistoricalTweets("once");
    expect(
      mockedAxios.get
    ).toHaveBeenCalledWith(
      `www.twitter.com/1.1/statuses/user_timeline.json?screen_name=dog_rates&count=200&exclude_replies=true&trim_user=true&tweet_mode=extended`,
      { headers: { Authorization: "Bearer auth-token" } }
    );
  });

  it("saves fetched tweets in the database, skipping non-2020 and non-'This is'", async () => {
    tweetRepo.findAll.mockResolvedValue([]);
    mockedAxios.get.mockResolvedValue({ data: twitterResponseFixture });
    await populateHistoricalTweets("once");
    expect(tweetRepo.save).toHaveBeenNthCalledWith(1, {
      id: "1332764426294988803",
      content:
        "This is Dixie. She’s half german shepherd and half bloodhound, resulting in the greatest ears we have ever seen. 14/10 #SeniorPupSaturday https://t.co/uP2BGK3XMi",
      date: "2020-11-28T19:12:55.000Z",
      imageUrls: [
        "http://pbs.twimg.com/media/En7uLhTXEAc-XWg.jpg",
        "http://pbs.twimg.com/media/En7uLg2VoAAYCtC.jpg",
      ],
      compareCount: 0,
      selectedCount: 0,
      lastCompared: "",
    });
  });
});
