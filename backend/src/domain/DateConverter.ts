import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

const twitterFormat = "MMM DD HH:mm:ss ZZ YYYY";
export const twitterDateToIso = (twitterDate: string): string => {
  return dayjs(twitterDate.substring(4), twitterFormat).toISOString();
};

export const isoToTwitterDate = (isoDate: string): string => {
  return dayjs(isoDate)
    .utc()
    .format("ddd " + twitterFormat);
};
