/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { snsSelectedProjectNewTxData } from "$lib/derived/sns/sns-selected-project-new-tx-data.derived";
import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { page } from "$mocks/$app/stores";
import {
  mockSnsSwapCommitment,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("selected-project-new-transaction-data derived store", () => {
  describe("snsSelectedProjectNewTxData", () => {
    const rootCanisterId = rootCanisterIdMock;

    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      snsSwapCommitmentsStore.reset();
      transactionsFeesStore.reset();
    });

    it("returns undefined when nns", () => {
      const $store = get(snsSelectedProjectNewTxData);
      expect($store).toBeUndefined();
    });

    it("returns the data for the a new Tx from the current universe", () => {
      const token = {
        name: "name",
        symbol: "symbol",
      };
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
          tokenMetadata: token,
        },
      ]);

      page.mock({ data: { universe: rootCanisterId.toText() } });

      const fee = mockSnsToken.fee;
      transactionsFeesStore.setFee({
        rootCanisterId,
        fee,
        certified: true,
      });

      const storeData = get(snsSelectedProjectNewTxData);
      expect(storeData.rootCanisterId.toText()).toEqual(
        rootCanisterId.toText()
      );
      expect(storeData.token).toEqual(token);
      expect(storeData.transactionFee.toE8s()).toEqual(fee);
    });

    it("returns undefined if no transaction fee", () => {
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);

      page.mock({ data: { universe: rootCanisterId.toText() } });

      expect(get(snsSelectedProjectNewTxData)).toBeUndefined();
    });
  });
});
