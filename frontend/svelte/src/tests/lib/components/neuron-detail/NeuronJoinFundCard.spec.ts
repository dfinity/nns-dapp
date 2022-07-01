/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NeuronJoinFundCard from "../../../../lib/components/neuron-detail/NeuronJoinFundCard.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { authStore } from "../../../../lib/stores/auth.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

describe("NeuronJoinFundCard", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockMainAccount.principal?.toText() as string,
    },
  };
  const props = {
    neuron,
  };

  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
      );
  });

  it("renders join community fund button", () => {
    // Button is tested separately
    const { queryByText } = render(NeuronJoinFundCard, {
      props,
    });

    expect(
      queryByText(en.neuron_detail.join_community_fund)
    ).toBeInTheDocument();
  });

  it("renders no button if user is not controller", () => {
    const props = {
      neuron: {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "not-controller",
        },
      },
    };

    const { queryByText } = render(NeuronJoinFundCard, {
      props,
    });

    expect(
      queryByText(en.neuron_detail.join_community_fund)
    ).not.toBeInTheDocument();
  });

  it("renders no button if neuron already part of the fund", () => {
    const props = {
      neuron: {
        ...neuron,
        joinedCommunityFundTimestampSeconds: BigInt(200),
      },
    };

    const { queryByText } = render(NeuronJoinFundCard, {
      props,
    });

    expect(
      queryByText(en.neuron_detail.join_community_fund)
    ).not.toBeInTheDocument();
  });
});
