import express, { Request, Response } from "express";
import path from "path";
import { populateHistoricalTweetsFactory } from "./domain/populateHistoricalTweets";
import { PostgresTweetRepo } from "./database/PostgresTweetRepo";
import { routerFactory } from "./routes/router";
import { getComparisonPairFactory } from "./domain/get-comparison-pair/getComparisonPair";
import { RandomApiClient } from "./random-api/RandomApiClient";
import bodyParser from "body-parser";
import { addComparisonFactory } from "./domain/add-comparison/addComparison";
import { PostgresTokenRepo } from "./database/PostgresTokenRepo";
import { TokenServiceFactory } from "./domain/token-service/TokenService";

const connection = {
  user: process.env.DB_USER || "postgres",
  host: process.env.HOST || "localhost",
  database: process.env.DB_NAME || "dograteslocal",
  password: process.env.DB_PASS || "",
  port: 5432,
};

const twitterBaseUrl = process.env.TWITTER_BASEURL || "https://api.twitter.com";
const twitterToken = process.env.TWITTER_TOKEN || "";

const tweetRepo = PostgresTweetRepo(connection);
const tokenRepo = PostgresTokenRepo(connection);

const populateHistoricalTweets = populateHistoricalTweetsFactory(tweetRepo, twitterBaseUrl, twitterToken);

const randomBaseUrl = process.env.RANDOM_API_BASEURL || "http://www.random.org";
const randomApiClient = RandomApiClient(randomBaseUrl);

const getComparisonPair = getComparisonPairFactory(randomApiClient.getRandom, tweetRepo.findAll);
const addComparison = addComparisonFactory(tweetRepo.findById, tweetRepo.update);
const tokenService = TokenServiceFactory(tokenRepo);

const router = routerFactory({ getComparisonPair, addComparison, tokenService });

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "build")));
app.use("/api", router);

app.post("/populate", (req: Request, res: Response) => {
  populateHistoricalTweets()
    .then(() => res.send("success"))
    .catch((e) => res.send(e));
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

export default app;
