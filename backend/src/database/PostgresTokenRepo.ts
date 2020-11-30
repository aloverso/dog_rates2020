import knex, { PgConnectionConfig } from "knex";
import { TokenRepo } from "../domain/types";
import dayjs from "dayjs";

interface TokenEntity {
  token: string;
  created: string;
}

export const PostgresTokenRepo = (connection: PgConnectionConfig): TokenRepo => {
  const kdb = knex({
    client: "pg",
    connection: connection,
  });

  const save = async (token: string): Promise<string> => {
    return await kdb("tokens")
      .insert<TokenEntity>({
        token: token,
        created: dayjs(),
      })
      .then(() => {
        return token;
      })
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });
  };

  const tokenExists = async (token: string): Promise<boolean> => {
    return await kdb("tokens")
      .select("token")
      .where("token", token)
      .then((data: string[]) => {
        return data.length > 0;
      })
      .catch(() => false);
  };

  const remove = async (token: string): Promise<boolean> => {
    return await kdb("tokens")
      .where("token", token)
      .del()
      .then((numRowsDeleted: number) => {
        return numRowsDeleted > 0;
      })
      .catch(() => false);
  };

  const disconnect = async (): Promise<void> => {
    await kdb.destroy();
  };

  return {
    save,
    tokenExists,
    remove,
    disconnect,
  };
};
