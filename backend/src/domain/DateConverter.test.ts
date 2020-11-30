import { isoToTwitterDate, twitterDateToIso } from "./DateConverter";

describe("date converter", () => {
  it("converts twitter formatted dates to iso strings", () => {
    const twitterDate = "Fri Nov 20 13:09:16 +0000 2020";
    expect(twitterDateToIso(twitterDate)).toEqual("2020-11-20T13:09:16.000Z");
  });

  it("converts iso dates to twitter formatted strings", () => {
    expect(isoToTwitterDate("2020-11-20T13:09:16.000Z")).toEqual("Fri Nov 20 13:09:16 +0000 2020");
  });
});
