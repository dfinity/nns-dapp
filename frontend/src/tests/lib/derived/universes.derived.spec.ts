import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { universesStore } from "$lib/derived/universes.derived";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("universes derived stores", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return Nns, ckBTC and ckTESTBTC (flag for test is true) per default", () => {
    const store = get(universesStore);
    expect(store.length).toEqual(3);
    expect(store[0].summary).toBeUndefined();
    expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
    expect(store[1].summary).toBeUndefined();
    expect(store[1].canisterId).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
  });

  it("should return Nns, ckBTC, ckTESTBTC (flag for test is true) and SNS projects", () => {
    const snsRootCanisterId = rootCanisterIdMock;
    setSnsProjects([
      {
        lifecycle: SnsSwapLifecycle.Committed,
        rootCanisterId: snsRootCanisterId,
      },
    ]);
    const store = get(universesStore);
    expect(store.length).toEqual(4);
    expect(store[3].summary).not.toBeUndefined();
    expect(store[3].canisterId).toEqual(snsRootCanisterId.toText());
  });
});
