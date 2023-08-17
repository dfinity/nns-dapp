/**
 * @jest-environment jsdom
 */

import SnsNeuronCard from "$lib/components/sns-neurons/SnsNeuronCard.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "$lib/constants/constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { authStore } from "$lib/stores/auth.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  SnsNeuronPermissionType,
  SnsSwapLifecycle,
  type SnsNeuron,
} from "@dfinity/sns";
import type { NeuronPermission } from "@dfinity/sns/dist/candid/sns_governance";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

const permissionsWithTypeVote = [
  {
    principal: [mockIdentity.getPrincipal()],
    permission_type: Int32Array.from([
      SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
    ]),
  } as NeuronPermission,
];
describe("SnsNeuronCard", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);
  });

  const defaultProps = {
    ariaLabel: "test label",
  };

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: rootCanisterIdMock,
        lifecycle: SnsSwapLifecycle.Open,
        certified: true,
      },
    ]);
  });

  it("renders a Card", () => {
    const { getByTestId } = render(SnsNeuronCard, {
      props: { neuron: mockSnsNeuron, ...defaultProps },
    });

    const articleElement = getByTestId("neuron-card");

    expect(articleElement).not.toBeNull();
  });

  it("is clickable", async () => {
    const spyClick = jest.fn();
    const { getByTestId, component } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        ...defaultProps,
      },
    });
    component.$on("click", spyClick);

    const articleElement = getByTestId("neuron-card");

    articleElement && (await fireEvent.click(articleElement));

    expect(spyClick).toBeCalled();
  });

  it("renders aria-label passed", () => {
    const ariaLabel = "test label";
    const { getByTestId } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        ariaLabel,
      },
    });

    const articleElement = getByTestId("neuron-card");
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("should render a hyperlink", () => {
    const href = "https://test.com";

    const { getByTestId } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        href,
      },
    });

    const linkElement = getByTestId("neuron-card");
    expect(linkElement?.tagName.toLowerCase()).toEqual("a");
    expect(linkElement?.getAttribute("href")).toEqual(href);
  });

  it("renders the neuron stake and identifier", async () => {
    const { queryAllByText, getByText } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        ...defaultProps,
      },
    });
    const token = get(snsTokenSymbolSelectedStore);
    expect(token).not.toBeUndefined();
    token !== undefined && expect(getByText(token.symbol)).toBeInTheDocument();
    expect(queryAllByText(en.core.icp).length).toBe(0);

    const stakeText = formatToken({
      value:
        mockSnsNeuron.cached_neuron_stake_e8s - mockSnsNeuron.neuron_fees_e8s,
      detailed: true,
    });
    expect(getByText(stakeText)).toBeInTheDocument();
    expect(
      queryAllByText(getSnsNeuronIdAsHexString(mockSnsNeuron)).length
    ).toBeGreaterThan(0);
  });

  it("renders proper text when status is LOCKED", async () => {
    const MORE_THAN_ONE_YEAR = 60 * 60 * 24 * 365 * 1.5;
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [
            {
              DissolveDelaySeconds:
                BigInt(nowInSeconds()) + BigInt(MORE_THAN_ONE_YEAR),
            },
          ],
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neuron_state.Locked)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVED", async () => {
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [],
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neuron_state.Dissolved)).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVING", async () => {
    // Add one day of buffer to avoid flakiness
    const ONE_YEAR_FROM_NOW = SECONDS_IN_YEAR + nowInSeconds() + SECONDS_IN_DAY;
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [
            {
              WhenDissolvedTimestampSeconds: BigInt(ONE_YEAR_FROM_NOW),
            },
          ],
          permissions: permissionsWithTypeVote,
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neuron_state.Dissolving)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders the hotkey_control label when user has only voting and proposal permissions", async () => {
    const hotkeyneuron: SnsNeuron = {
      ...mockSnsNeuron,
      permissions: [
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
        },
      ],
    };
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: hotkeyneuron,
      },
    });

    expect(getByText(en.neurons.hotkey_control)).toBeInTheDocument();
  });
});
