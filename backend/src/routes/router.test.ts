import request from "supertest";
import express, { Express, Router } from "express";
import { routerFactory } from "./router";
import { generateComparisonPair, generateComparisonSelection } from "../domain/test-objects/factories";
import bodyParser from "body-parser";
import { StubTokenService } from "../domain/test-objects/StubTokenService";
import anything = jasmine.anything;

describe("router", () => {
  let app: Express;
  let router: Router;
  let stubGetComparisonPair: jest.Mock;
  let stubAddComparison: jest.Mock;
  let stubTokenService: StubTokenService;

  beforeEach(() => {
    stubGetComparisonPair = jest.fn();
    stubAddComparison = jest.fn();
    stubTokenService = StubTokenService();

    router = routerFactory({
      getComparisonPair: stubGetComparisonPair,
      addComparison: stubAddComparison,
      tokenService: stubTokenService,
    });
    app = express();
    app.use(bodyParser.json());
    app.use(router);
  });

  describe("/comparison", () => {
    it("gets a pair of tweets to compare with a token", (done) => {
      const pair = generateComparisonPair({});
      stubGetComparisonPair.mockResolvedValue(pair);
      stubTokenService.generate.mockResolvedValue("some-token");

      request(app)
        .get("/comparison")
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            ...pair,
            token: anything(),
          });
          expect(stubGetComparisonPair).toHaveBeenCalled();
          done();
        });
    });

    it("sends a 500 when something fails", (done) => {
      stubGetComparisonPair.mockRejectedValue({});
      request(app).get("/comparison").expect(500).end(done);
    });
  });

  describe("/compare", () => {
    it("calls compare on a valid token", (done) => {
      stubTokenService.validate.mockResolvedValue(true);
      const selection = generateComparisonSelection({});
      const selectionRequest = { ...selection, token: "valid-token" };
      stubAddComparison.mockResolvedValue({});
      request(app)
        .post("/compare")
        .send(selectionRequest)
        .then((response) => {
          expect(stubTokenService.validate).toHaveBeenCalledWith(
            "valid-token",
            selection.tweet1Id,
            selection.tweet2Id
          );
          expect(stubAddComparison).toHaveBeenCalledWith(selection);
          expect(response.status).toEqual(201);
          done();
        });
    });

    describe("when bad data", () => {
      beforeEach(() => {
        stubTokenService.validate.mockResolvedValue(true);
        stubAddComparison.mockResolvedValue({});
      });

      it("sends an error when missing token", (done) => {
        const noToken = { ...generateComparisonSelection({}), token: undefined };
        request(app)
          .post("/compare")
          .send(noToken)
          .then((response) => {
            expect(response.status).toEqual(400);
            done();
          });
      });

      it("sends an error when missing id1", (done) => {
        const noId1 = { ...generateComparisonSelection({ tweet1Id: undefined }), token: "token" };
        request(app)
          .post("/compare")
          .send(noId1)
          .then((response) => {
            expect(response.status).toEqual(400);
            done();
          });
      });

      it("sends an error when missing id2", (done) => {
        const noId2 = { ...generateComparisonSelection({ tweet2Id: undefined }), token: "token" };
        request(app)
          .post("/compare")
          .send(noId2)
          .then((response) => {
            expect(response.status).toEqual(400);
            done();
          });
      });

      it("sends an error when missing selection", (done) => {
        const noSelection = {
          ...generateComparisonSelection({ selection: undefined }),
          token: "token",
        };
        request(app)
          .post("/compare")
          .send(noSelection)
          .then((response) => {
            expect(response.status).toEqual(400);
            done();
          });
      });

      it("sends an error when selection is not one of the the two ids", (done) => {
        const badSelection = {
          ...generateComparisonSelection({ selection: "some-random-id" }),
          token: "token",
        };
        request(app)
          .post("/compare")
          .send(badSelection)
          .then((response) => {
            expect(response.status).toEqual(400);
            done();
          });
      });
    });

    it("sends error and does not save when invalid token", (done) => {
      const selectionRequest = { ...generateComparisonSelection({}), token: "invalid-token" };
      stubTokenService.validate.mockResolvedValue(false);
      request(app)
        .post("/compare")
        .send(selectionRequest)
        .then((response) => {
          expect(response.status).toEqual(400);
          expect(stubAddComparison).not.toHaveBeenCalled();
          done();
        });
    });

    it("sends a 500 when something fails", (done) => {
      stubAddComparison.mockRejectedValue({});
      request(app).get("/comparison").expect(500).end(done);
    });
  });
});
