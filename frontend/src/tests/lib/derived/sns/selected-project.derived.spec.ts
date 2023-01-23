/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  snsOnlyProjectStore,
  snsProjectSelectedStore,
} from "$lib/derived/sns/sns-selected-project.derived";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import { mockSnsSwapCommitment } from "../../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../../mocks/sns-response.mock";
import { mockSnsCanisterIdText } from "../../../mocks/sns.api.mock";

describe("selected sns project derived stores", () => {
  describe("snsOnlyProjectStore", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });

    it("should be set by default undefined", () => {
      const $store = get(snsOnlyProjectStore);

      expect($store).toBeUndefined();
    });

    it("should return project principal if an sns project is selected", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });
      const $store = get(snsOnlyProjectStore);

      expect($store?.toText()).toBe(mockSnsCanisterIdText);
    });

    it("should return undefined if nns is selected after sns project", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const $store = get(snsOnlyProjectStore);
      expect($store?.toText()).toBe(mockSnsCanisterIdText);

      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store2 = get(snsOnlyProjectStore);
      expect($store2).toBeUndefined();
    });
  });

  describe("snsProjectSelectedStore", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });
    it("returns the SNS project of the current universe", () => {
      const projectData = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
      });
      const rootCanisterIdText = projectData[0][0].rootCanisterId;

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(
          Principal.fromText(rootCanisterIdText)
        ),
        certified: true,
      });

      snsQueryStore.setData(projectData);

      page.mock({ data: { universe: rootCanisterIdText } });

      const storeData = get(snsProjectSelectedStore);
      expect(storeData.rootCanisterId.toText()).toEqual(rootCanisterIdText);
    });

    it("returns undefined when nns", () => {
      const storeData = get(snsProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });
  });
});
