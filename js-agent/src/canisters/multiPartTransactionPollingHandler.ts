import NnsUiService, { MultiPartTransactionStatus } from "./nnsUI/model";
import { BlockHeight } from "./common/types";

const ONE_MINUTE_MILLIS = 60 * 1000;

export const pollUntilComplete = async (nnsUiService: NnsUiService, blockHeight: BlockHeight) : Promise<MultiPartTransactionStatus> => {
    const start = Date.now();
    while (Date.now() - start < ONE_MINUTE_MILLIS) {
        // Wait 5 seconds between each attempt
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            const status = await nnsUiService.getMultiPartTransactionStatus(blockHeight);

            if ("CanisterCreated" in status) {
                return status;
            } else if ("Refunded" in status) {
                return status
            } else if ("NotFound" in status) {
                throw new Error("Create canister request not found in the NNS UI canister");
            } else if ("Error" in status) {
                throw new Error(status.Error);
            }
        } catch (e) {
            console.log(e);
            // If there is an error while getting the status simply swallow the error and try again
        }
    }

    throw new Error("Failed to complete multi part transaction. Request may still be queued");
}
