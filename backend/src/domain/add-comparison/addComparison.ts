import { AddComparison, ComparisonSelection, FindTweetById, UpdateTweet } from "../types";
import dayjs from "dayjs";

export const addComparisonFactory = (findTweet: FindTweetById, updateTweet: UpdateTweet): AddComparison => {
  return async (comparisonSelection: ComparisonSelection): Promise<void> => {
    const tweet1 = await findTweet(comparisonSelection.tweet1Id);
    const tweet2 = await findTweet(comparisonSelection.tweet2Id);

    const now = dayjs().toISOString();

    const selectionAdder = (id: string): number => {
      return id === comparisonSelection.selection ? 1 : 0;
    };

    await updateTweet({
      id: tweet1.id,
      compareCount: tweet1.compareCount + 1,
      selectedCount: tweet1.selectedCount + selectionAdder(tweet1.id),
      lastCompared: now,
    });

    await updateTweet({
      id: tweet2.id,
      compareCount: tweet2.compareCount + 1,
      selectedCount: tweet2.selectedCount + selectionAdder(tweet2.id),
      lastCompared: now,
    });

    return Promise.resolve();
  };
};
