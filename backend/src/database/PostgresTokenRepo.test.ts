import { TokenRepo } from "../domain/types";
import { PostgresTokenRepo } from "./PostgresTokenRepo";

describe("PostgresTokenRepo", () => {
  let tokenRepo: TokenRepo;

  beforeAll(async () => {
    const connection = {
      user: "postgres",
      host: "localhost",
      database: "dogratestest",
      password: "",
      port: 5432,
    };
    tokenRepo = PostgresTokenRepo(connection);
  });

  it("returns a token exists when saved", async () => {
    await tokenRepo.save("some token");
    expect(await tokenRepo.tokenExists("some token")).toEqual(true);
  });

  it("returns a token does not exist when not saved", async () => {
    expect(await tokenRepo.tokenExists("nonexistent token")).toEqual(false);
  });

  it("a token no longer exists when removed", async () => {
    await tokenRepo.save("some token");
    expect(await tokenRepo.tokenExists("some token")).toEqual(true);
    const wasRemoved = await tokenRepo.remove("some token");
    expect(await tokenRepo.tokenExists("some token")).toEqual(false);
    expect(wasRemoved).toBe(true);
  });

  it("returns false when removing a token that does not exist", async () => {
    const wasRemoved = await tokenRepo.remove("nonexistent");
    expect(wasRemoved).toBe(false);
  });

  afterAll(async () => {
    await tokenRepo.disconnect();
  });
});
