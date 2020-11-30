import { AddComparison } from "../types";
import { addComparisonFactory } from "./addComparison";
import { generateComparisonSelection, generateTweet } from "../test-objects/factories";
import dayjs from "dayjs";
import anything = jasmine.anything;

describe("addComparison", () => {
  let mockUpdate: jest.Mock;
  let mockFindTweet: jest.Mock;
  let addComparison: AddComparison;

  beforeEach(() => {
    mockUpdate = jest.fn();
    mockFindTweet = jest.fn();
    addComparison = addComparisonFactory(mockFindTweet, mockUpdate);
  });

  it("updates the repo for the winning and losing tweet", async () => {
    const selection = generateComparisonSelection({
      tweet1Id: "1",
      tweet2Id: "2",
      selection: "2",
    });

    const tweet1 = generateTweet({
      id: "1",
      compareCount: 2,
      selectedCount: 5,
      lastCompared: "2020-11-20T13:09:16.000Z",
    });

    const tweet2 = generateTweet({
      id: "2",
      compareCount: 15,
      selectedCount: 8,
      lastCompared: "2020-11-19T13:09:16.000Z",
    });

    mockFindTweet.mockResolvedValueOnce(tweet1).mockResolvedValueOnce(tweet2);

    const now = dayjs();
    await addComparison(selection);
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenNthCalledWith(1, {
      id: "1",
      compareCount: 3,
      selectedCount: 5,
      lastCompared: anything(),
    });

    expect(mockUpdate).toHaveBeenNthCalledWith(2, {
      id: "2",
      compareCount: 16,
      selectedCount: 9,
      lastCompared: anything(),
    });

    expect(dayjs(mockUpdate.mock.calls[0].lastCompared).diff(now)).toBeLessThan(100);
    expect(dayjs(mockUpdate.mock.calls[1].lastCompared).diff(now)).toBeLessThan(100);
  });
});
