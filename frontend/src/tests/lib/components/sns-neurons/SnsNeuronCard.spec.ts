/**
 * @jest-environment jsdom
 */

import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  SnsSwapLifecycle,
  type SnsNeuron,
} from "@dfinity/sns";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import SnsNeuronCard from "../../../../lib/components/sns-neurons/SnsNeuronCard.svelte";
import { OWN_CANISTER_ID } from "../../../../lib/constants/canister-ids.constants";
import { SECONDS_IN_YEAR } from "../../../../lib/constants/constants";
import { snsTokenSymbolSelectedStore } from "../../../../lib/derived/sns/sns-token-symbol-selected.store";
import { authStore } from "../../../../lib/stores/auth.store";
import { snsProjectSelectedStore } from "../../../../lib/stores/projects.store";
import { snsQueryStore } from "../../../../lib/stores/sns.store";
import { nowInSeconds } from "../../../../lib/utils/date.utils";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { getSnsNeuronIdAsHexString } from "../../../../lib/utils/sns-neuron.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import { snsResponsesForLifecycle } from "../../../mocks/sns-response.mock";

describe("SnsNeuronCard", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  const defaultProps = {
    role: "link",
    ariaLabel: "test label",
  };
  const data = snsResponsesForLifecycle({
    lifecycles: [SnsSwapLifecycle.Open],
    certified: true,
  });
  beforeEach(() => {
    snsQueryStore.setData(data);
    const [snsMetadatas] = data;
    snsProjectSelectedStore.set(
      Principal.fromText(snsMetadatas[0].rootCanisterId)
    );
  });
  afterEach(() => {
    snsQueryStore.reset();
    snsProjectSelectedStore.set(OWN_CANISTER_ID);
  });
  it("renders a Card", () => {
    const { container } = render(SnsNeuronCard, {
      props: { neuron: mockSnsNeuron, ...defaultProps },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement).not.toBeNull();
  });

  it("is clickable", async () => {
    const spyClick = jest.fn();
    const { container, component } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        ...defaultProps,
      },
    });
    component.$on("click", spyClick);

    const articleElement = container.querySelector("article");

    articleElement && (await fireEvent.click(articleElement));

    expect(spyClick).toBeCalled();
  });

  it("renders role and aria-label passed", async () => {
    const role = "link";
    const ariaLabel = "test label";
    const { container } = render(SnsNeuronCard, {
      props: {
        neuron: mockSnsNeuron,
        role,
        ariaLabel,
      },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement?.getAttribute("role")).toBe(role);
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
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
    token !== undefined && expect(getByText(token)).toBeInTheDocument();
    expect(queryAllByText(en.core.icp).length).toBe(0);

    const stakeText = formatICP({
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
    const ONE_YEAR_FROM_NOW = SECONDS_IN_YEAR + Math.round(Date.now() / 1000);
    const { getByText } = render(SnsNeuronCard, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [
            {
              WhenDissolvedTimestampSeconds: BigInt(ONE_YEAR_FROM_NOW),
            },
          ],
        },
        ...defaultProps,
      },
    });

    expect(getByText(en.neuron_state.Dissolving)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders the hotkey_control label when user has only voting permissions", async () => {
    const hotkeyneuron: SnsNeuron = {
      ...mockSnsNeuron,
      permissions: [
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: [
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
          ],
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
