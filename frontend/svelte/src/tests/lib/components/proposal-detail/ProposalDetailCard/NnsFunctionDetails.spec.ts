/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { get } from "svelte/store";
import { NNSDappCanister } from "../../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import NnsFunctionDetails from "../../../../../lib/components/proposal-detail/ProposalDetailCard/NnsFunctionDetails.svelte";
import { proposalPayloadsStore } from "../../../../../lib/stores/proposals.store";
import en from "../../../../mocks/i18n.mock";

describe("NnsFunctionDetails", () => {
  const $proposalPayloadsStore = get(proposalPayloadsStore);
  let spyOnGetPayload: jest.SpyInstance<unknown>;

  const mockPayload = { data: "test" };
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue(mockPayload);
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  beforeEach(() => {
    spyOnGetPayload = jest.spyOn($proposalPayloadsStore, "getPayload");
  });

  beforeEach(() => {
    proposalPayloadsStore.reset();
    spyOnGetPayload.mockClear();
  });

  afterAll(jest.clearAllMocks);

  it("should render nnsFunction title", () => {
    const { getByText } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    expect(getByText(en.proposal_detail.nns_function_name)).toBeInTheDocument();
  });

  it("should render nnsFunction name", () => {
    const { getByText } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    expect(getByText(en.nns_function_names["1"])).toBeInTheDocument();
  });

  it("should display spinner if no payload", () => {
    spyOnGetPayload.mockImplementation(() => undefined);

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    expect(queryByTestId("spinner")).toBeInTheDocument();
  });

  it("should not display spinner if payload was loaded", () => {
    spyOnGetPayload.mockImplementation(() => mockPayload);

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    expect(spyOnGetPayload).toBeCalled();
    expect(queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should not display spinner if payload is not available", () => {
    spyOnGetPayload.mockImplementation(() => null);

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    expect(queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should start payload fetching", async () => {
    const spyOnGetProposalPayload = jest.spyOn(
      nnsDappMock,
      "getProposalPayload"
    );
    spyOnGetProposalPayload.mockClear();
    // spyOnGetPayload.mockImplementation(() => null);

    render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    await waitFor(() => expect(spyOnGetProposalPayload).toBeCalledTimes(1));
  });

  it("should display payload object as Json", async () => {
    spyOnGetPayload.mockImplementation(() => mockPayload);

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    await waitFor(() => expect(queryByTestId("json")).toBeInTheDocument());
  });

  it("should display payload fields", async () => {
    spyOnGetPayload.mockImplementation(() => mockPayload);

    const { container } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    await waitFor(() =>
      expect(
        container.querySelector(".key-value .key")?.innerHTML?.trim()
      ).toEqual("data:")
    );
    expect(container.querySelector(".key-value .value")?.innerHTML).toEqual(
      '"test"'
    );
  });
});
