import bcrypt from "bcryptjs";
import { StubTokenRepo } from "../test-objects/StubTokenRepo";
import { TokenService } from "../types";
import { TokenServiceFactory } from "./TokenService";
jest.mock("bcryptjs");

const mockNow = "2020-11-20T16:57:25.000Z";
const mockNowMillis = 1605891445000;

jest.mock("dayjs", () =>
  jest.fn((...args) => jest.requireActual("dayjs")(args.filter((arg) => arg).length > 0 ? args : mockNow))
);

describe("TokenService", () => {
  let mockedBcrypt: jest.Mocked<typeof bcrypt>;
  let stubTokenRepo: StubTokenRepo;
  let tokenService: TokenService;

  beforeEach(() => {
    mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
    stubTokenRepo = StubTokenRepo();
    tokenService = TokenServiceFactory(stubTokenRepo);
  });

  describe("generate", () => {
    it("creates a token by hashing the ids and adding salt len and epoch millis", async () => {
      mockedBcrypt.genSalt.mockImplementation(() => Promise.resolve("salt"));
      mockedBcrypt.hash.mockImplementation((s, salt) => {
        expect(salt).toEqual("salt");
        expect(s).toEqual("123456");
        return Promise.resolve("salthashed123456");
      });

      const token = await tokenService.generate("123", "456");
      expect(token).toEqual("salthashed123456+4+1605891445000");
    });

    it("saves the generated token", async () => {
      mockedBcrypt.genSalt.mockImplementation(() => Promise.resolve("salt"));
      mockedBcrypt.hash.mockImplementation(() => {
        return Promise.resolve("salthashed123456");
      });

      await tokenService.generate("123", "456");
      expect(stubTokenRepo.save).toHaveBeenCalledWith(`salthashed123456+${"salt".length}+${mockNowMillis}`);
    });
  });

  describe("validate", () => {
    it("returns false when the token does not exist in the repo", async () => {
      stubTokenRepo.tokenExists.mockResolvedValue(false);
      const isValid = await tokenService.validate("nonexistent-token", "123", "456");
      expect(isValid).toBe(false);
      expect(stubTokenRepo.tokenExists).toHaveBeenCalledWith("nonexistent-token");
    });

    it("returns false when token exists in repo but does not match the ids passed", async () => {
      stubTokenRepo.tokenExists.mockResolvedValue(true);

      mockedBcrypt.hash.mockImplementation((s, salt) => {
        expect(salt).toEqual("salt");
        expect(s).toEqual("123456");
        return Promise.resolve("salthashed123456");
      });

      const isValid = await tokenService.validate("salthashed999999+4+somedate", "123", "456");
      expect(isValid).toBe(false);
    });

    it("returns true when token exists in repo and matches the ids passed", async () => {
      stubTokenRepo.tokenExists.mockResolvedValue(true);

      mockedBcrypt.hash.mockImplementation((s, salt) => {
        expect(salt).toEqual("salt");
        expect(s).toEqual("123456");
        return Promise.resolve("salthashed123456");
      });

      const isValid = await tokenService.validate("salthashed123456+4+somedate", "123", "456");
      expect(isValid).toBe(true);
    });

    it("removes the token from the repo on a true validation", async () => {
      stubTokenRepo.tokenExists.mockResolvedValue(true);

      mockedBcrypt.hash.mockImplementation(() => {
        return Promise.resolve("salthashed123456");
      });

      await tokenService.validate("salthashed123456+4+somedate", "123", "456");
      expect(stubTokenRepo.remove).toHaveBeenCalledWith("salthashed123456+4+somedate");
    });
  });
});
