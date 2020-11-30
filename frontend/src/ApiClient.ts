import { Client, Observer } from "./domain/Client";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Error } from "./domain/Error";
import { ComparisonPair, ComparisonSelection } from "./domain/types";

export const ApiClient = (): Client => {
  const getComparisonPair = (observer: Observer<ComparisonPair>): void => {
    get(`/api/comparison`, observer);
  };

  const addComparison = (selection: ComparisonSelection, observer: Observer<string>): void => {
    post(`/api/compare`, selection, observer);
  };

  const get = <T>(endpoint: string, observer: Observer<T>): void => {
    axios
      .get(endpoint)
      .then((response: AxiosResponse<T>) => {
        observer.onSuccess(response.data);
      })
      .catch((errorResponse: AxiosError<T>) => {
        if (errorResponse.response?.status === 404) {
          return observer.onError(Error.NOT_FOUND);
        }

        return observer.onError(Error.SYSTEM_ERROR);
      });
  };

  const post = <T, R>(endpoint: string, body: R, observer: Observer<T>): void => {
    axios
      .post(endpoint, body)
      .then((response: AxiosResponse<T>) => {
        observer.onSuccess(response.data);
      })
      .catch((errorResponse: AxiosError<T>) => {
        if (errorResponse.response?.status === 404) {
          return observer.onError(Error.NOT_FOUND);
        }

        return observer.onError(Error.SYSTEM_ERROR);
      });
  };

  return {
    getComparisonPair,
    addComparison,
  };
};
