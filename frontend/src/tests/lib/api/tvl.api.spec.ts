import { queryTVL } from "$lib/api/tvl.api.cjs";
import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
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

describe("tvl api", () => {
  const tvlCanisterMock = mock<TVLCanister>();

  beforeAll(() => {
    jest.spyOn(TVLCanister, "create").mockImplementation(() => tvlCanisterMock);
  });

  afterAll(() => jest.clearAllMocks());

  const params = {
    identity: new AnonymousIdentity(),
    certified: true,
  };

  it("returns the tvl", async () => {
    const result = {
      tvl: 1n,
      time_sec: 0n,
    };

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
