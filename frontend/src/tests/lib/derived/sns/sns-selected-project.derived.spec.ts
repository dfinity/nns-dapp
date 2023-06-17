/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  snsCommittedProjectSelectedStore,
  snsOnlyProjectStore,
  snsProjectSelectedStore,
} from "$lib/derived/sns/sns-selected-project.derived";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockSnsSwapCommitment } from "$tests/mocks/sns-projects.mock";
import {
  snsResponseFor,
  snsResponsesForLifecycle,
} from "$tests/mocks/sns-response.mock";
import {
  mockSnsCanisterId,
  mockSnsCanisterIdText,
} from "$tests/mocks/sns.api.mock";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("selected sns project derived stores", () => {
  beforeEach(() => {
    snsQueryStore.reset();
  });

  describe("snsOnlyProjectStore", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      snsQueryStore.setData(
        snsResponseFor({
          principal: mockSnsCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        })
      );
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

    it("returns undefined if the project doesn't exist", () => {
      const projectData = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
      });
      const rootCanisterIdText = projectData[0][0].rootCanisterId;
      const nonExistentProjectIdText = Principal.fromHex("123456").toText();

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(
          Principal.fromText(rootCanisterIdText)
        ),
        certified: true,
      });

      snsQueryStore.setData(projectData);

      page.mock({ data: { universe: nonExistentProjectIdText } });

      const storeData = get(snsProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });

    it("returns undefined when nns", () => {
      const storeData = get(snsProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });
  });

  describe("snsCommittedProjectSelectedStore", () => {
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

      const storeData = get(snsCommittedProjectSelectedStore);
      expect(storeData.rootCanisterId.toText()).toEqual(rootCanisterIdText);
    });

    it("returns undefined if the project doesn't exist", () => {
      const projectData = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
      });
      const rootCanisterIdText = projectData[0][0].rootCanisterId;
      const nonExistentProjectIdText = Principal.fromHex("123456").toText();

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(
          Principal.fromText(rootCanisterIdText)
        ),
        certified: true,
      });

      snsQueryStore.setData(projectData);

      page.mock({ data: { universe: nonExistentProjectIdText } });

      const storeData = get(snsCommittedProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });

    it("returns undefined if the project isn't committed", () => {
      const projectData = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open],
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

      const storeData = get(snsCommittedProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });

    it("returns undefined when nns", () => {
      const storeData = get(snsCommittedProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });
  });
});
