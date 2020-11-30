/* eslint-disable @typescript-eslint/no-explicit-any */

import { Client, Observer } from "../domain/Client";
import { ComparisonPair, ComparisonSelection } from "../domain/types";

export class StubClient implements Client {
  capturedGetObserver: Observer<any> = {
    onError: () => {},
    onSuccess: () => {},
  };

  capturedPostObserver: Observer<any> = {
    onError: () => {},
    onSuccess: () => {},
  };

  capturedSelection: ComparisonSelection | undefined;
  getComparisonPairCalledTimes = 0;

  getComparisonPair = (observer: Observer<ComparisonPair>): void => {
    this.capturedGetObserver = observer;
    this.getComparisonPairCalledTimes += 1;
  };

  addComparison = (selection: ComparisonSelection, observer: Observer<string>): void => {
    this.capturedPostObserver = observer;
    this.capturedSelection = selection;
  };
}
