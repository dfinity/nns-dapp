import NnsUiService, { MultiPartTransactionStatus } from "./nnsUI/model";
import { BlockHeight } from "./common/types";

const ONE_MINUTE_MILLIS = 60 * 1000;

export const pollUntilComplete = async (
  nnsUiService: NnsUiService,
  blockHeight: BlockHeight
): Promise<MultiPartTransactionStatus> => {
  const start = Date.now();
  while (Date.now() - start < ONE_MINUTE_MILLIS) {
    // Wait 5 seconds between each attempt
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const status = await nnsUiService.getMultiPartTransactionStatus(
        blockHeight
      );

      if (!isStillPending(status)) {
        return status;
      }
    } catch (e) {
      // If there is an error while getting the status simply swallow the error and try again
      console.log(e);
    }
  }

  throw new Error(
    "Failed to complete multi part transaction. Request may still be queued"
  );
};

const isStillPending = (status: MultiPartTransactionStatus): boolean => {
  return (
    "Queued" in status ||
    "PendingSync" in status ||
    "ErrorWithRefundPending" in status
  );
};
