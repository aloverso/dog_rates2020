/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { fireEvent, render, RenderResult } from "@testing-library/react";
import React from "react";
import { App } from "./App";
import { StubClient } from "./test-objects/StubClient";
import { generateComparisonPair, generateTweetResponse } from "./test-objects/factories";
import { act } from "react-dom/test-utils";
import { Error } from "./domain/Error";

describe("<App />", () => {
  let stubClient: StubClient;
  let subject: RenderResult;

  beforeEach(() => {
    stubClient = new StubClient();
    subject = render(<App client={stubClient} />);
  });

  it("fetches and displays a comparison pair on load", () => {
    const pair = generateComparisonPair({});
    act(() => stubClient.capturedGetObserver.onSuccess(pair));

    expect(subject.queryByText(pair.tweet1.content)).toBeInTheDocument();
    expect(subject.queryByText(pair.tweet2.content)).toBeInTheDocument();
  });

  it("removes links from display text", () => {
    const pair = generateComparisonPair({
      tweet1: generateTweetResponse({ content: "some stuff https://t.co/as235j blah" }),
      tweet2: generateTweetResponse({ content: "more things https://t.co/whatever something" }),
    });
    act(() => stubClient.capturedGetObserver.onSuccess(pair));

    expect(subject.queryByText("some stuff blah")).toBeInTheDocument();
    expect(subject.queryByText("more things something")).toBeInTheDocument();
  });

  it("links to the original twitter post when one link in tweet", () => {
    const pair = generateComparisonPair({
      tweet1: generateTweetResponse({ content: "text https://realtwitterlink.com" }),
    });

    act(() => stubClient.capturedGetObserver.onSuccess(pair));

    expect(subject.getAllByAltText("view on twitter")[0].parentElement!.getAttribute("href")).toEqual(
      "https://realtwitterlink.com"
    );
  });

  it("links to the original twitter post when two link in tweet", () => {
    const pair = generateComparisonPair({
      tweet2: generateTweetResponse({
        content: "text https://otherlink.com https://realtwitterlink.com",
      }),
    });

    act(() => stubClient.capturedGetObserver.onSuccess(pair));

    expect(subject.getAllByAltText("view on twitter")[1].parentElement!.getAttribute("href")).toEqual(
      "https://realtwitterlink.com"
    );
  });

  it("adds images", () => {
    const pair = generateComparisonPair({
      tweet1: generateTweetResponse({
        content: "This is dog 1",
        imageUrls: ["http://image1.png", "http://image2.png"],
      }),
      tweet2: generateTweetResponse({
        content: "This is dog 2",
        imageUrls: ["http://image3.png"],
      }),
    });
    act(() => stubClient.capturedGetObserver.onSuccess(pair));

    expect(subject.getByAltText('1 of 2 for "This is dog 1"').getAttribute("src")).toEqual(
      "http://image1.png"
    );
    expect(subject.getByAltText('2 of 2 for "This is dog 1"').getAttribute("src")).toEqual(
      "http://image2.png"
    );
    expect(subject.getByAltText('1 of 1 for "This is dog 2"').getAttribute("src")).toEqual(
      "http://image3.png"
    );
  });

  it("displays the formatted date", () => {
    const pair = generateComparisonPair({
      tweet1: generateTweetResponse({
        date: "2020-11-20T13:09:16.000Z",
      }),
    });
    act(() => stubClient.capturedGetObserver.onSuccess(pair));
    expect(subject.getByText("Nov 20, 2020", { exact: false })).toBeInTheDocument();
    expect(subject.getByText(":09", { exact: false })).toBeInTheDocument();
  });

  it("sends a compare with selection when voting button clicked for tweet1", () => {
    const pair = generateComparisonPair({});
    act(() => stubClient.capturedGetObserver.onSuccess(pair));
    fireEvent.click(subject.getByText("This dog is the most 13/10"));

    expect(stubClient.capturedSelection?.tweet1Id).toEqual(pair.tweet1.id);
    expect(stubClient.capturedSelection?.tweet2Id).toEqual(pair.tweet2.id);
    expect(stubClient.capturedSelection?.selection).toEqual(pair.tweet1.id);
    expect(stubClient.capturedSelection?.token).toEqual(pair.token);
  });

  it("sends a compare with selection when voting button clicked for tweet2", () => {
    const pair = generateComparisonPair({});
    act(() => stubClient.capturedGetObserver.onSuccess(pair));
    fireEvent.click(subject.getByText("This dog is the Goodest boy"));
    expect(stubClient.capturedSelection?.tweet1Id).toEqual(pair.tweet1.id);
    expect(stubClient.capturedSelection?.tweet2Id).toEqual(pair.tweet2.id);
    expect(stubClient.capturedSelection?.selection).toEqual(pair.tweet2.id);
    expect(stubClient.capturedSelection?.token).toEqual(pair.token);
  });

  it("gets new pair on successful selection", () => {
    const pair = generateComparisonPair({
      tweet1: generateTweetResponse({ content: "first pair" }),
    });
    act(() => stubClient.capturedGetObserver.onSuccess(pair));
    fireEvent.click(subject.getByText("This dog is the Goodest boy"));

    expect(stubClient.getComparisonPairCalledTimes).toEqual(1);
    act(() => stubClient.capturedPostObserver.onSuccess("ok"));
    expect(stubClient.getComparisonPairCalledTimes).toEqual(2);

    const pair2 = generateComparisonPair({
      tweet1: generateTweetResponse({ content: "second pair" }),
    });
    act(() => stubClient.capturedGetObserver.onSuccess(pair2));
    expect(subject.queryByText("second pair")).toBeInTheDocument();
    expect(subject.queryByText("first pair")).not.toBeInTheDocument();
  });

  it("shows a spinner while pair is loading", () => {
    const pair = generateComparisonPair({});
    expect(subject.queryByRole("progressbar")).toBeInTheDocument();
    act(() => stubClient.capturedGetObserver.onSuccess(pair));
    expect(subject.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows a message if compare fails", () => {
    const pair = generateComparisonPair({});
    act(() => stubClient.capturedGetObserver.onSuccess(pair));
    fireEvent.click(subject.getByText("This dog is the most 13/10"));

    expect(subject.queryByText("Sorry, something went wrong")).not.toBeInTheDocument();

    act(() => stubClient.capturedGetObserver.onError(Error.BAD_REQUEST));
    expect(subject.queryByText("Sorry, something went wrong")).toBeInTheDocument();
  });
});
