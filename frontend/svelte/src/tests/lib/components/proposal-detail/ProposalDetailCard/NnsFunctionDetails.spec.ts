/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import NnsFunctionDetails from "../../../../../lib/components/proposal-detail/ProposalDetailCard/NnsFunctionDetails.svelte";
import en from "../../../../mocks/i18n.mock";

describe("NnsFunctionDetails", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue({ data: "test" });
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

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

  it("should display spinner before payload", () => {
    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    expect(queryByTestId("spinner")).toBeInTheDocument();
  });

  it("should hide spinner after payload response", async () => {
    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    await waitFor(() =>
      expect(queryByTestId("spinner")).not.toBeInTheDocument()
    );
  });

  it("should display payload object as Json", async () => {
    const { queryByTestId } = render(NnsFunctionDetails, {
      props: {
        proposalId: BigInt(0),
        nnsFunctionId: BigInt(1),
      },
    });

    await waitFor(() => expect(queryByTestId("json")).toBeInTheDocument());
  });

  it("should display payload fields", async () => {
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
