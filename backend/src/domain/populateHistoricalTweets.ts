/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios, { AxiosResponse } from "axios";
import { PopulateHistoricalTweets, Tweet, TweetRepo } from "./types";
import { twitterDateToIso } from "./DateConverter";
import dayjs from "dayjs";
import twitterResponseFixture from "./twitterResponseFixture.json";

interface TweetResponse {
  id_str: string;
  created_at: string;
  full_text: string;
  extended_entities?: ExtendedEntity;
}

interface ExtendedEntity {
  media: MediaEntity[];
}

interface MediaEntity {
  media_url: string;
}

export const populateHistoricalTweetsFactory = (
  tweetRepo: TweetRepo,
  twitterBaseUrl: string,
  twitterAuth: string
): PopulateHistoricalTweets => {
  return async (once?: string): Promise<void> => {
    let ranOutOf2020Tweets = false;
    while (!ranOutOf2020Tweets) {
      const existingTweets = await tweetRepo.findAll();

      let url = `${twitterBaseUrl}/1.1/statuses/user_timeline.json?screen_name=dog_rates&count=200&exclude_replies=true&trim_user=true&tweet_mode=extended`;

      if (existingTweets.length > 0) {
        const oldestTweet = sortTweetsOldToNew(existingTweets)[0];
        url = `${url}&max_id=${oldestTweet.id}`;
      }

      const tweets = (
        await getBatch(
          url,
          existingTweets.map((it) => it.id),
          twitterAuth
        )
      )
        .filter((it: Tweet) => is2020(it) && startsWithThisIs(it))
        .filter((it) => !existingTweets.map((it) => it.id).includes(it.id));

      const savedTweets = await Promise.all(
        tweets.map(async (tweet: Tweet): Promise<Tweet> => await tweetRepo.save(tweet))
      );

      if (savedTweets.length === 0 || !!once) {
        ranOutOf2020Tweets = true;
      }
    }
  };
};

const getBatch = async (url: string, existingIds: string[], twitterAuth: string): Promise<Tweet[]> => {
  return (await makeTweetRequest(url, twitterAuth))
    .filter((it: TweetResponse) => hasImages(it))
    .map(
      (it: TweetResponse): Tweet => ({
        id: it.id_str,
        date: twitterDateToIso(it.created_at),
        content: it.full_text,
        imageUrls: it.extended_entities!.media.map((media) => media.media_url),
        compareCount: 0,
        selectedCount: 0,
        lastCompared: "",
      })
    );
};

const makeTweetRequest = async (url: string, twitterAuth: string): Promise<TweetResponse[]> => {
  if (!twitterAuth) {
    return twitterResponseFixture;
  }

  return await axios
    .get(url, { headers: { Authorization: `Bearer ${twitterAuth}` } })
    .then((response: AxiosResponse<TweetResponse[]>): TweetResponse[] => response.data)
    .catch((err) => {
      console.log("axios error:", err);
      return Promise.reject({});
    });
};

const sortTweetsOldToNew = (tweets: Tweet[]): Tweet[] => {
  return tweets.sort((a, b) => (a.date < b.date ? -1 : 1));
};

const hasImages = (tweet: TweetResponse): boolean => {
  return !!tweet.extended_entities;
};

const is2020 = (tweet: Tweet): boolean => {
  return dayjs(tweet.date).get("year") === 2020;
};

const startsWithThisIs = (tweet: Tweet): boolean => {
  return tweet.content.substring(0, 7) === "This is";
};
