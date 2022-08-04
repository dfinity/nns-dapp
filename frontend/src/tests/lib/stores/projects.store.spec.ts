import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import { OWN_CANISTER_ID } from "../../../lib/constants/canister-ids.constants";
import {
  activePadProjectsStore,
  committedProjectsStore,
  isNnsProjectStore,
  snsProjectSelectedStore,
} from "../../../lib/stores/projects.store";
import {
  snsQueryStore,
  snsSwapCommitmentsStore,
} from "../../../lib/stores/sns.store";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

describe("projects.store", () => {
  describe("filter projects store", () => {
    beforeAll(() => {
      snsQueryStore.reset();
    });

    afterAll(() => {
      snsQueryStore.reset();
    });

    const principalRootCanisterId = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principalRootCanisterId),
      certified: true,
    });

    it("should filter projects that are active", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Open] })
      );
      const open = get(activePadProjectsStore);
      expect(open?.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed],
        })
      );
      const open2 = get(activePadProjectsStore);
      expect(open2?.length).toEqual(2);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Unspecified] })
      );
      const noOpen = get(activePadProjectsStore);
      expect(noOpen?.length).toEqual(0);
    });

    it("should filter projects that are committed only", () => {
      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Committed] })
      );

      const committed = get(committedProjectsStore);
      expect(committed?.length).toEqual(1);

      snsQueryStore.setData(
        snsResponsesForLifecycle({ lifecycles: [SnsSwapLifecycle.Open] })
      );
      const noCommitted = get(committedProjectsStore);
      expect(noCommitted?.length).toEqual(0);
    });
  });

  describe("isNnsProjectStore", () => {
    beforeEach(() => {
      snsProjectSelectedStore.set(OWN_CANISTER_ID);
    });

    it("should be set by default true", () => {
      const $store = get(isNnsProjectStore);

      expect($store).toEqual(true);
    });

    it("should be false if an sns project is selected", () => {
      snsProjectSelectedStore.set(Principal.fromText("aaaaa-aa"));
      const $store = get(isNnsProjectStore);

      expect($store).toBe(false);
    });
  });

  describe("snsProjectSelectedStore", () => {
    beforeEach(() => {
      snsProjectSelectedStore.set(OWN_CANISTER_ID);
    });

    it("should be set by default to own canister id", () => {
      const $store = get(snsProjectSelectedStore);

      expect($store).toEqual(OWN_CANISTER_ID);
    });

    it("should able to set it to another project id", () => {
      const $store1 = get(snsProjectSelectedStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      const newPrincipal = Principal.fromText("aaaaa-aa");
      snsProjectSelectedStore.set(newPrincipal);

      const $store2 = get(snsProjectSelectedStore);
      expect($store2).toEqual(newPrincipal);
    });
  });
});
