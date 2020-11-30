import { TokenRepo, TokenService } from "../types";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";

export const TokenServiceFactory = (tokenRepo: TokenRepo): TokenService => {
  const generate = async (id1: string, id2: string): Promise<string> => {
    const tokenSeed = `${id1}${id2}`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(tokenSeed, salt);

    const token = `${hash}+${salt.length}+${dayjs().valueOf()}`;

    await tokenRepo.save(token);

    return token;
  };

  const validate = async (token: string, id1: string, id2: string): Promise<boolean> => {
    try {
      const exists = await tokenRepo.tokenExists(token);
      const [hash, saltLength] = token.split("+");
      const salt = hash.substring(0, parseInt(saltLength));

      const recreatedHash = await bcrypt.hash(id1 + id2, salt);
      const isMatch = hash === recreatedHash;

      if (exists && isMatch) {
        await tokenRepo.remove(token);
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  };

  return {
    generate,
    validate,
  };
};
