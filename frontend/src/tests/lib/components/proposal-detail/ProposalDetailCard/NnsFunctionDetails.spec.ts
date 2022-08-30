/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { tick } from "svelte";
import { NNSDappCanister } from "../../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import NnsFunctionDetails from "../../../../../lib/components/proposal-detail/ProposalDetailCard/NnsFunctionDetails.svelte";
import { proposalPayloadsStore } from "../../../../../lib/stores/proposals.store";
import en from "../../../../mocks/i18n.mock";
import {NnsFunction} from '@dfinity/nns';

describe("NnsFunctionDetails", () => {
  const mockPayload = { data: "test" };
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue(mockPayload);
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  beforeEach(() => {
    proposalPayloadsStore.reset();
  });

  afterAll(jest.clearAllMocks);

  it("should render nnsFunction title", () => {
    const { getByText } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    expect(getByText(en.proposal_detail.nns_function_name)).toBeInTheDocument();
  });

  it("should render nnsFunction name", () => {
    const { getByText } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    expect(getByText(en.nns_functions.CreateSubnet)).toBeInTheDocument();
  });

  it("should display spinner if no payload", () => {
    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    expect(queryByTestId("spinner")).toBeInTheDocument();
  });

  it("should not display spinner if payload was loaded", () => {
    proposalPayloadsStore.setPayload({
      proposalId: BigInt(0),
      payload: mockPayload,
    });

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    expect(queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should not display spinner if payload is not available", () => {
    proposalPayloadsStore.setPayload({ proposalId: BigInt(0), payload: null });

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    expect(queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should start payload loading", async () => {
    const spyOnGetProposalPayload = jest.spyOn(
      nnsDappMock,
      "getProposalPayload"
    );
    spyOnGetProposalPayload.mockClear();

    render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    await waitFor(() => expect(spyOnGetProposalPayload).toBeCalled());
  });

  it("should not call getProposalPayload if the payload is available", async () => {
    proposalPayloadsStore.setPayload({
      proposalId: BigInt(0),
      payload: mockPayload,
    });

    const spyOnGetProposalPayload = jest.spyOn(
      nnsDappMock,
      "getProposalPayload"
    );
    spyOnGetProposalPayload.mockClear();

    render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    await tick();

    expect(spyOnGetProposalPayload).toBeCalledTimes(0);
  });

  it("should display payload object as Json", async () => {
    proposalPayloadsStore.setPayload({
      proposalId: BigInt(0),
      payload: mockPayload,
    });

    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
      },
    });

    await waitFor(() => expect(queryByTestId("json")).toBeInTheDocument());
  });

  it("should display payload fields", async () => {
    proposalPayloadsStore.setPayload({
      proposalId: BigInt(0),
      payload: mockPayload,
    });

    const { container } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunction: NnsFunction.CreateSubnet,
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
