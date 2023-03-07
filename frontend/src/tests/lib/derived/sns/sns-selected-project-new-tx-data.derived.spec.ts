/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsSelectedProjectNewTxData } from "$lib/derived/sns/sns-selected-project-new-tx-data.derived";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { page } from "$mocks/$app/stores";
import {
  mockSnsSwapCommitment,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("selected-project-new-transaction-data derived store", () => {
  describe("snsSelectedProjectNewTxData", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      snsQueryStore.reset();
      snsSwapCommitmentsStore.reset();
      transactionsFeesStore.reset();
    });
    it("returns undefined when nns", () => {
      const $store = get(snsSelectedProjectNewTxData);
      expect($store).toBeUndefined();
    });
    it("returns the data for the a new Tx from the current universe", () => {
      const projectData = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
      });

      const rootCanisterIdText = projectData[0][0].rootCanisterId;
      const tokenData = projectData[0][0].token;
      const rootCanisterId = Principal.fromText(rootCanisterIdText);

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

      snsQueryStore.setData(projectData);

      page.mock({ data: { universe: rootCanisterIdText } });

      const fee = mockSnsToken.fee;
      transactionsFeesStore.setFee({
        rootCanisterId,
        fee,
        certified: true,
      });

      const token = mapOptionalToken(tokenData);

      const storeData = get(snsSelectedProjectNewTxData);
      expect(storeData.rootCanisterId.toText()).toEqual(rootCanisterIdText);
      expect(storeData.token).toEqual({
        name: token.name,
        symbol: token.symbol,
      });
      expect(storeData.transactionFee.toE8s()).toEqual(fee);
    });

    it("returns undefined if no transaction fee", () => {
      const projectData = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
      });
      const rootCanisterIdText = projectData[0][0].rootCanisterId;
      const rootCanisterId = Principal.fromText(rootCanisterIdText);

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

      snsQueryStore.setData(projectData);

      page.mock({ data: { universe: rootCanisterIdText } });

      expect(get(snsSelectedProjectNewTxData)).toBeUndefined();
    });
  });
});
