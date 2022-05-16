/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import JoinCommunityFundButton from "../../../../../lib/components/neuron-detail/actions/JoinCommunityFundButton.svelte";
import { joinCommunityFund } from "../../../../../lib/services/neurons.services";
import en from "../../../../mocks/i18n.mock";

jest.mock("../../../../../lib/services/neurons.services", () => {
  return {
    joinCommunityFund: jest.fn().mockResolvedValue(undefined),
  };
});

describe("JoinCommunityFundButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders join community fund message", () => {
    const { getByText } = render(JoinCommunityFundButton, {
      props: {
        neuronId: BigInt(10),
      },
    });

    expect(getByText(en.neuron_detail.join_community_fund)).toBeInTheDocument();
  });

  it("allows neuron to join community fund", async () => {
    const { container, queryByTestId } = render(JoinCommunityFundButton, {
      props: {
        neuronId: BigInt(10),
      },
    });

    const buttonElement = container.querySelector("button");

    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("join-community-fund-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
    expect(joinCommunityFund).toBeCalled();
  });
});
