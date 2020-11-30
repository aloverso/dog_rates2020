import knex, { PgConnectionConfig } from "knex";
import { Tweet, TweetRepo } from "../domain/types";

interface TweetEntity {
  id: string;
  datestring: string;
  content: string;
  comparecount: number;
  selectedcount: number;
  lastcompared: string;
}

interface ImageEntity {
  id: string;
  imgurl: string;
}

export const PostgresTweetRepo = (connection: PgConnectionConfig): TweetRepo => {
  const kdb = knex({
    client: "pg",
    connection: connection,
  });

  const findAll = async (): Promise<Tweet[]> => {
    const tweetEntities: TweetEntity[] = await kdb("tweets")
      .select<TweetEntity[]>("*")
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });

    const tweets = tweetEntities.map(
      async (it): Promise<Tweet> => {
        const imageEntities = await kdb("images")
          .select<ImageEntity[]>("*")
          .where("id", it.id)
          .catch((e) => {
            console.log("db error: ", e);
            return Promise.reject();
          });

        return {
          id: it.id,
          content: it.content,
          date: it.datestring,
          imageUrls: imageEntities.map((it) => it.imgurl),
          compareCount: it.comparecount,
          selectedCount: it.selectedcount,
          lastCompared: it.lastcompared,
        };
      }
    );

    return await Promise.all(tweets);
  };

  const findById = async (id: string): Promise<Tweet> => {
    const tweetEntity: TweetEntity | undefined = await kdb("tweets")
      .select<TweetEntity[]>("*")
      .where("id", id)
      .first()
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });

    if (!tweetEntity) {
      return Promise.reject("ID not found");
    }

    const imageEntities = await kdb("images")
      .select<ImageEntity[]>("*")
      .where("id", id)
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });

    return {
      id: tweetEntity.id,
      content: tweetEntity.content,
      date: tweetEntity.datestring,
      imageUrls: imageEntities.map((it) => it.imgurl),
      compareCount: tweetEntity.comparecount,
      selectedCount: tweetEntity.selectedcount,
      lastCompared: tweetEntity.lastcompared,
    };
  };

  const update = async (partialTweet: Partial<Tweet>): Promise<Tweet> => {
    if (!partialTweet.id) {
      return Promise.reject("id required for update");
    }

    const partialEntity: Partial<TweetEntity> = {
      id: partialTweet.id,
      datestring: partialTweet.date,
      content: partialTweet.content,
      comparecount: partialTweet.compareCount,
      selectedcount: partialTweet.selectedCount,
      lastcompared: partialTweet.lastCompared,
    };

    await kdb("tweets").where("id", partialTweet.id).update(partialEntity);

    return await findById(partialTweet.id);
  };

  const save = async (tweet: Tweet): Promise<Tweet> => {
    const tweetEntity = {
      id: tweet.id,
      datestring: tweet.date,
      content: tweet.content,
      comparecount: tweet.compareCount,
      selectedcount: tweet.selectedCount,
      lastcompared: tweet.lastCompared,
    };

    const imageEntities = tweet.imageUrls.map(
      (it): ImageEntity => ({
        id: tweet.id,
        imgurl: it,
      })
    );

    await kdb("tweets")
      .insert<TweetEntity>(tweetEntity)
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });

    await kdb("images")
      .insert<ImageEntity>(imageEntities)
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });

    return tweet;
  };

  const disconnect = async (): Promise<void> => {
    await kdb.destroy();
  };

  return {
    findAll,
    save,
    findById,
    update,
    disconnect,
  };
};
