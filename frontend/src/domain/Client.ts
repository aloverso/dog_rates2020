import { Error } from "./Error";
import { ComparisonPair, ComparisonSelection } from "./types";

export interface Client {
  getComparisonPair: (observer: Observer<ComparisonPair>) => void;
  addComparison: (selection: ComparisonSelection, observer: Observer<string>) => void;
}

export interface Observer<T> {
  onSuccess: (result: T) => void;
  onError: (error: Error) => void;
}
