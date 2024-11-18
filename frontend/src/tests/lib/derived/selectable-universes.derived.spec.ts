import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_UNIVERSE_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { page } from "$mocks/$app/stores";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import {
  resetCkETHCanisters,
  setCkETHCanisters,
} from "$tests/utils/cketh.test-utils";
import { get } from "svelte/store";

describe("selectable universes derived stores", () => {
  beforeEach(() => {
    resetCkETHCanisters();

    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: OWN_CANISTER_ID.toText() },
    });
  });

  it("should return Nns, ckBTC and ckTESTBTC (flag for test is true) per default", () => {
    const store = get(selectableUniversesStore);
    expect(store.length).toEqual(3);
    expect(store[0].summary).toBeUndefined();
    expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
    expect(store[1].summary).toBeUndefined();
    expect(store[1].canisterId).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
  });

  it("should return CkETH in Accounts page", () => {
    setCkETHCanisters();
    const store = get(selectableUniversesStore);
    expect(store.length).toEqual(4);
    expect(store[3].summary).toBeUndefined();
    expect(store[3].canisterId).toEqual(CKETH_UNIVERSE_CANISTER_ID.toText());
  });

  it("should not return ckBTC if path is not Account", () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: OWN_CANISTER_ID.toText() },
    });

    const store = get(selectableUniversesStore);
    // 1 length = only NNS
    expect(store.length).toEqual(1);
    expect(store[0].canisterId).not.toEqual(
      CKBTC_UNIVERSE_CANISTER_ID.toText()
    );
  });

  it("should not return ckETH if path is not Account", () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: OWN_CANISTER_ID.toText() },
    });
    setCkETHCanisters();

    const store = get(selectableUniversesStore);
    // 1 length = only NNS
    expect(store.length).toEqual(1);
    expect(store[0].canisterId).not.toEqual(
      CKBTC_UNIVERSE_CANISTER_ID.toText()
    );
  });

  describe("with projects", () => {
    beforeEach(() => {
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([mockSnsFullProject])
      );
    });

    it("should return Nns, ckBTC, ckTESTBTC (flag for test is true) and another project", () => {
      const store = get(selectableUniversesStore);
      expect(store.length).toEqual(4);
      expect(store[3].summary).not.toBeUndefined();
      expect(store[3].canisterId).toEqual(
        mockSnsFullProject.rootCanisterId.toText()
      );
    });
  });
});
