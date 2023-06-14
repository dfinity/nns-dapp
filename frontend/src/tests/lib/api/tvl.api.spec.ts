import { queryTVL } from "$lib/api/tvl.api.cjs";
import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { AnonymousIdentity } from "@dfinity/agent";
import mock from "jest-mock-extended/lib/Mock";

jest.mock("@dfinity/agent", () => {
  const agent = jest.requireActual("@dfinity/agent");
  return {
    ...agent,
    HttpAgent: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

jest.mock("$lib/constants/canister-ids.constants");

describe("tvl api", () => {
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
    jest.clearAllMocks();
    jest.spyOn(TVLCanister, "create").mockImplementation(() => tvlCanisterMock);
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
