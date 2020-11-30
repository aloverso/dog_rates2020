import axios from "axios";
import { ApiClient } from "./ApiClient";
import { Client } from "./domain/Client";
import { generateComparisonPair, generateComparisonSelection } from "./test-objects/factories";
import { ComparisonPair } from "./domain/types";

jest.mock("axios");

describe("ApiClient", () => {
  let apiClient: Client;
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios = axios as jest.Mocked<typeof axios>;
    apiClient = ApiClient();
  });

  describe("getComparisonPair", () => {
    it("calls observer with successful comparison pair data", (done) => {
      const pair = generateComparisonPair({});
      mockedAxios.get.mockResolvedValue({ data: pair });

      const observer = {
        onSuccess: (data: ComparisonPair): void => {
          expect(data).toEqual(pair);
          done();
        },
        onError: jest.fn(),
      };

      apiClient.getComparisonPair(observer);
    });

    it("calls observer with error and type when GET fails", (done) => {
      mockedAxios.get.mockRejectedValue({});

      const observer = {
        onSuccess: jest.fn(),
        onError: (): void => {
          done();
        },
      };

      apiClient.getComparisonPair(observer);
    });
  });

  describe("addComparison", () => {
    it("uses selection as post data and calls observer with success", (done) => {
      const selection = generateComparisonSelection({});
      mockedAxios.post.mockResolvedValue({ data: "ok" });

      const observer = {
        onSuccess: (data: string): void => {
          expect(data).toEqual("ok");
          done();
        },
        onError: jest.fn(),
      };

      apiClient.addComparison(selection, observer);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/compare", selection);
    });

    it("calls observer with error and type when GET fails", (done) => {
      mockedAxios.post.mockRejectedValue({});

      const observer = {
        onSuccess: jest.fn(),
        onError: (): void => {
          done();
        },
      };

      apiClient.addComparison(generateComparisonSelection({}), observer);
    });
  });
});
