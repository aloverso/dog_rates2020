import { Request, Response, Router } from "express";
import { AddComparison, GetComparisonPair, TokenService, TweetResponse } from "../domain/types";

interface RouterProps {
  getComparisonPair: GetComparisonPair;
  addComparison: AddComparison;
  tokenService: TokenService;
}

interface ComparisonPairResponse {
  tweet1: TweetResponse;
  tweet2: TweetResponse;
  token: string;
}

interface ComparisonSelectionRequest {
  tweet1Id: string;
  tweet2Id: string;
  selection: string;
  token: string;
}

export const routerFactory = ({ getComparisonPair, addComparison, tokenService }: RouterProps): Router => {
  const router = Router();

  router.get("/comparison", async (req: Request, res: Response<ComparisonPairResponse>) => {
    try {
      const pair = await getComparisonPair();
      const token = await tokenService.generate(pair.tweet1.id, pair.tweet2.id);
      res.status(200).json({
        ...pair,
        token: token,
      });
    } catch (e) {
      res.status(500).send(e);
    }
  });

  router.post("/compare", async (req: Request<ComparisonSelectionRequest>, res: Response<string>) => {
    if (!req.body.token || !req.body.tweet1Id || !req.body.tweet2Id || !req.body.selection) {
      res.status(400).send("missing data");
      return;
    }
    if (![req.body.tweet1Id, req.body.tweet2Id].includes(req.body.selection)) {
      res.status(400).send("invalid selection");
      return;
    }

    const isValid = await tokenService.validate(req.body.token, req.body.tweet1Id, req.body.tweet2Id);
    if (!isValid) {
      res.status(400).send("token invalid");
      return;
    }

    addComparison({ ...req.body, token: undefined })
      .then(() => res.status(201).send("ok"))
      .catch((e) => res.status(500).send(e));
  });

  return router;
};
