import React, { ReactElement, useEffect, useState, useCallback } from "react";
import { Client } from "./domain/Client";
import { RouteComponentProps } from "@reach/router";
import { ComparisonPair } from "./domain/types";
import { Tweet } from "./Tweet";
import { DotLoader } from "react-spinners";
import { Snackbar } from "@material-ui/core";
import { Alert as MuiAlert } from "@material-ui/lab";

interface Props extends RouteComponentProps {
  client: Client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Alert = (props: any): ReactElement => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

export const App = (props: Props): ReactElement => {
  const [pair, setPair] = useState<ComparisonPair | undefined>(undefined);
  const [isError, setIsError] = useState<boolean>(false);

  const getComparisonPair = useCallback((): void => {
    props.client.getComparisonPair({
      onSuccess: setPair,
      onError: () => {
        setIsError(true);
      },
    });
  }, [props.client]);

  useEffect(() => {
    getComparisonPair();
  }, [getComparisonPair]);

  const sendSelection = (selectionId: string): void => {
    if (!pair) return;
    const selectionComparison = {
      tweet1Id: pair.tweet1.id,
      tweet2Id: pair.tweet2.id,
      selection: selectionId,
      token: pair.token,
    };
    props.client.addComparison(selectionComparison, {
      onSuccess: () => {
        setPair(undefined);
        getComparisonPair();
      },
      onError: () => {
        setIsError(true);
      },
    });
  };

  return (
    <div className="container">
      <div className="row mtl">
        <div className="col-sm-5">
          <h1 className="text-xl mbs">who's the best dog?</h1>
        </div>
        <div className="col-sm-7">
          <div className="phd pvxs bg-lightblue">
            <p>
              <strong>Note:</strong> they're all good dogs
            </p>
          </div>
        </div>
      </div>

      {!pair && (
        <div className="mtxl fdr fjc" role="progressbar">
          <DotLoader color="#1da1f2" />
        </div>
      )}

      {pair && (
        <div className="row mts">
          <div className="col-xs-6 tweet-col">
            <div className="mvm">
              <button onClick={(): void => sendSelection(pair.tweet1.id)}>This dog is the most 13/10</button>
            </div>
            <Tweet tweet={pair.tweet1} />
          </div>

          <div className="col-xs-6 tweet-col">
            <div className="mvm">
              <button onClick={(): void => sendSelection(pair.tweet2.id)}>This dog is the Goodest boy</button>
            </div>
            <Tweet tweet={pair.tweet2} />
          </div>
        </div>
      )}
      <Snackbar open={isError} autoHideDuration={6000} onClose={(): void => setIsError(false)}>
        <Alert onClose={(): void => setIsError(false)} severity="error">
          Sorry, something went wrong
        </Alert>
      </Snackbar>
    </div>
  );
};
