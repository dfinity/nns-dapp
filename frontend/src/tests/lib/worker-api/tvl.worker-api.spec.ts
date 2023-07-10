import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { queryTVL } from "$lib/worker-api/tvl.worker-api";
import { AnonymousIdentity } from "@dfinity/agent";
import mock from "jest-mock-extended/lib/Mock";
import { vi } from "vitest";

vi.mock("@dfinity/agent", async () => {
  const agent = vi.importActual("@dfinity/agent");
  return {
    ...agent,
    HttpAgent: vi.fn().mockImplementation(() => {
      return {};
    }),
  };
});

vi.mock("$lib/constants/canister-ids.constants");

describe("tvl worker-api", () => {
  const tvlCanisterMock = mock<TVLCanister>();
  const params = {
    identity: new AnonymousIdentity(),
    certified: true,
    ...ACTOR_PARAMS,
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
    const paramsCanisterId = {
      ...params,
      tvlCanisterId: "ewh3f-3qaaa-aaaap-aazjq-cai",
    };

    it("returns the tvl", async () => {
      const getTVLSpy = tvlCanisterMock.getTVL.mockResolvedValue(result);

      const response = await queryTVL(paramsCanisterId);

      expect(response).toEqual(result);

      expect(getTVLSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      tvlCanisterMock.getTVL.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => queryTVL(paramsCanisterId);

      expect(call).rejects.toThrowError();
    });
  });

  describe("with tvl canister id not set", () => {
    it("returns undefined", async () => {
      const getTVLSpy = tvlCanisterMock.getTVL.mockResolvedValue(result);

      const response = await queryTVL({
        ...params,
        tvlCanisterId: undefined,
      });

      expect(response).toBeUndefined();
      expect(getTVLSpy).not.toBeCalled();
    });
  });
});
