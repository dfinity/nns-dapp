import type { HttpAgent, Identity } from "@dfinity/agent";
import { GovernanceCanister } from "@dfinity/nns";
import { GOVERNANCE_CANISTER_ID } from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";

export type QueryAndUpdateResponse<Response> = {
  certified: boolean | undefined;
  response: Response;
};
export type QueryAndUpdateOnResponse<Response> = (
  params: QueryAndUpdateResponse<Response>
) => void;

export type QueryAndUpdateError<Error> = {
  certified: boolean | undefined;
  error: Error;
};
export type QueryAndUpdateOnError<Response> = (
  params: QueryAndUpdateError<Response>
) => void;

export const queryAndUpdate = <Response, TError>({
  request,
  onLoad,
  onError,
}: {
  request: (params: { certified: boolean }) => Promise<Response>;
  onLoad: QueryAndUpdateOnResponse<Response>;
  onError: QueryAndUpdateOnError<TError>;
}): Promise<void> => {
  let certifiedDone = false;

  return Promise.race([
    // query
    request({ certified: false })
      .then((response) => {
        if (certifiedDone) return;
        onLoad({ certified: false, response });
      })
      .catch((error: TError) => {
        if (certifiedDone) return;
        onError({ certified: false, error });
      }),

    // update
    request({ certified: true })
      .then((response) => {
        certifiedDone = true;
        onLoad({ certified: true, response });
      })
      .catch((error) => {
        certifiedDone = true;
        onError({ certified: true, error });
      }),
  ]).then();
};
