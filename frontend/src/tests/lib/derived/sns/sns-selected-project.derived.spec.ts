import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  snsCommittedProjectSelectedStore,
  snsOnlyProjectStore,
  snsProjectSelectedStore,
} from "$lib/derived/sns/sns-selected-project.derived";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import {
  mockSnsSwapCommitment,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("selected sns project derived stores", () => {
  const rootCanisterId = principal(0);
  const rootCanisterIdText = rootCanisterId.toText();
  beforeEach(() => {
    resetSnsProjects();
  });

  describe("snsOnlyProjectStore", () => {
    const ledgerCanisterId = principal(0);

    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
      icrcCanistersStore.reset();
      tokensStore.reset();
    });

    it("should be set by default undefined", () => {
      const $store = get(snsOnlyProjectStore);

      expect($store).toBeUndefined();
    });

    it("should return project principal if an sns project is selected", () => {
      page.mock({ data: { universe: rootCanisterIdText } });
      const $store = get(snsOnlyProjectStore);

      expect($store?.toText()).toBe(rootCanisterIdText);
    });

    it("should return undefined if nns is selected after sns project", () => {
      page.mock({ data: { universe: rootCanisterIdText } });

      const $store = get(snsOnlyProjectStore);
      expect($store?.toText()).toBe(rootCanisterIdText);

      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store2 = get(snsOnlyProjectStore);
      expect($store2).toBeUndefined();
    });

    it("should return undefined if ICRC Token universe is selected", () => {
      icrcCanistersStore.setCanisters({
        ledgerCanisterId: ledgerCanisterId,
        indexCanisterId: principal(3),
      });
      tokensStore.setTokens({
        [ledgerCanisterId.toText()]: {
          certified: true,
          token: mockCkETHToken,
        },
      });
      page.mock({ data: { universe: ledgerCanisterId.toText() } });

      expect(get(snsOnlyProjectStore)).toBeUndefined();
    });
  });

  describe("snsProjectSelectedStore", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });

    it("returns the SNS project of the current universe", () => {
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

      page.mock({ data: { universe: rootCanisterIdText } });

      const storeData = get(snsProjectSelectedStore);
      expect(storeData.rootCanisterId.toText()).toEqual(rootCanisterIdText);
    });

    it("returns undefined if the project doesn't exist", () => {
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
      const nonExistentProjectIdText = Principal.fromHex("123456").toText();

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

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
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

      page.mock({ data: { universe: rootCanisterIdText } });

      const storeData = get(snsCommittedProjectSelectedStore);
      expect(storeData.rootCanisterId.toText()).toEqual(rootCanisterIdText);
    });

    it("returns undefined if the project doesn't exist", () => {
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
      const nonExistentProjectIdText = Principal.fromHex("123456").toText();

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

      page.mock({ data: { universe: nonExistentProjectIdText } });

      const storeData = get(snsCommittedProjectSelectedStore);
      expect(storeData).toBeUndefined();
    });

    it("returns undefined if the project isn't committed", () => {
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Open,
        },
      ]);

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: mockSnsSwapCommitment(rootCanisterId),
        certified: true,
      });

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
