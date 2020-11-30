import React, { ReactElement } from "react";
import ModalImage from "react-modal-image";
import { TweetResponse } from "./domain/types";
import dogRatesIcon from "./assets/dog_rates.png";
import twitter from "./assets/twitter.svg";
import dayjs from "dayjs";
import { useMediaQuery } from "@material-ui/core";

interface Props {
  tweet: TweetResponse;
}

export const Tweet = (props: Props): ReactElement => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const urlRegex = /( https:\/\/[^\s]+)/g;

  const displayImages = (imgUrls: string[], text: string): ReactElement => {
    const pairedImgUrls = imgUrls.reduce(
      (result: string[][], value: string, index: number, array: string[]) => {
        if (index % 2 === 0) {
          const pair: string[] = array.slice(index, index + 2);
          result.push(pair);
        }
        return result;
      },
      []
    );

    return (
      <>
        {pairedImgUrls.map((imgUrlPair, i) => (
          <div className="row tweet-images row-no-gutters" key={i}>
            {imgUrlPair.map((imgUrl, i) => (
              <div className="col-xs-6 tweet-col" key={imgUrl}>
                <ModalImage
                  small={imgUrl}
                  large={imgUrl}
                  alt={`${i + 1} of ${imgUrls.length} for "${text}"`}
                  hideDownload={true}
                  hideZoom={true}
                  showRotate={false}
                />
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

  const getTwitterLink = (tweet: TweetResponse): string => {
    const urlMatches = tweet.content.match(urlRegex);
    if (!urlMatches || urlMatches.length === 0) {
      return "https://twitter.com/dog_rates";
    } else {
      return urlMatches[urlMatches.length - 1].trim();
    }
  };

  const getTweetText = (tweet: TweetResponse): string => {
    return tweet.content.replace(urlRegex, "");
  };

  return (
    <div className="tweet">
      <div className="fdr">
        {!isMobile && <img src={dogRatesIcon} className="icon mrd" alt="dog_rates icon" />}
        <div className="fdc lh-small fjc">
          <div className="bold">
            <a className="no-link-format underlinelink bold" href="https://twitter.com/dog_rates">
              WeRateDogs®
            </a>
          </div>
          <div className="text-grey">@dog_rates</div>
        </div>
        {!isMobile && (
          <div className="mla">
            <a className="pointer" href={getTwitterLink(props.tweet)}>
              <img alt="view on twitter" className="twitter" src={twitter} />
            </a>
          </div>
        )}
      </div>
      <h2 className="text-m mvd">{getTweetText(props.tweet)}</h2>
      {displayImages(props.tweet.imageUrls, getTweetText(props.tweet))}
      <div className="text-grey">
        <a
          className="no-link-format underlinelink"
          href={`https://twitter.com/dog_rates/status/${props.tweet.id}`}
        >
          {dayjs(props.tweet.date).format("h:mm A · MMM DD, YYYY")}
        </a>
      </div>
    </div>
  );
};
