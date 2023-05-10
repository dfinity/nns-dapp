import { queryTVL } from "$lib/api/tvl.api.cjs";
import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import { AnonymousIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("@dfinity/agent", async () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const agent = await vi.importActual<any>("@dfinity/agent");
  return {
    ...agent,
    HttpAgent: vi.fn().mockImplementation(() => {
      return {};
    }),
  };
});

const defaultTVLCanisterId = Principal.fromText("ewh3f-3qaaa-aaaap-aazjq-cai");
vi.mock("$lib/constants/canister-ids.constants");

describe("tvl api", () => {
  const tvlCanisterMock = mock<TVLCanister>();
  const params = {
    identity: new AnonymousIdentity(),
    certified: true,
  };

  const result = {
    tvl: 1n,
    time_sec: 0n,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(TVLCanister, "create").mockImplementation(() => tvlCanisterMock);
  });

  describe("with tvl canister id set", () => {
    beforeEach(async () => {
      // `import` returns "readonly" properties.
      // casting is needed to change the value
      const canisterIds = (await import(
        "$lib/constants/canister-ids.constants"
      )) as { TVL_CANISTER_ID: Principal };
      canisterIds.TVL_CANISTER_ID = defaultTVLCanisterId;
    });

    it("returns the tvl", async () => {
      const getTVLSpy = tvlCanisterMock.getTVL.mockResolvedValue(result);

      const response = await queryTVL(params);

      expect(response).toEqual(result);

      expect(getTVLSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      tvlCanisterMock.getTVL.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => queryTVL(params);

      expect(call).rejects.toThrowError();
    });
  });

  describe("with tvl canister id not set", () => {
    beforeEach(async () => {
      // `import` returns "readonly" properties.
      // casting is needed to change the value
      const canisterIds = (await import(
        "$lib/constants/canister-ids.constants"
      )) as { TVL_CANISTER_ID: Principal };
      canisterIds.TVL_CANISTER_ID = undefined;
    });

    it("returns undefined", async () => {
      const getTVLSpy = tvlCanisterMock.getTVL.mockResolvedValue(result);

      const response = await queryTVL(params);

      expect(response).toBeUndefined();
      expect(getTVLSpy).not.toBeCalled();
    });
  });
});
