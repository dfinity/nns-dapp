/**
 * @jest-environment jsdom
 */

import SnsNeuronMetaInfoCard from "$lib/components/sns-neuron-detail/SnsNeuronMetaInfoCard.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from "$lib/constants/constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { dispatchIntersecting } from "$lib/directives/intersection.directives";
import { authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken, mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronMetaInfoCardPo } from "$tests/page-objects/SnsNeuronMetaInfoCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import type { Token } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SnsNeuronMetaInfoCard", () => {
  const now = 1686806749421;
  const nowSeconds = Math.floor(now / 1000);
  beforeEach(() => {
    jest
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest.useFakeTimers().setSystemTime(now);
  });

  const renderSnsNeuronCmp = (
    extraPermissions: SnsNeuronPermissionType[] = [],
    neuron: SnsNeuron = mockSnsNeuron
  ) =>
    renderSelectedSnsNeuronContext({
      Component: SnsNeuronMetaInfoCard,
      neuron: {
        ...neuron,
        permissions: [
          ...mockSnsNeuron.permissions,
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from(extraPermissions),
          },
        ],
      },
      reload: jest.fn(),
      props: {
        parameters:
          snsNervousSystemParametersMock as SnsNervousSystemParameters,
        token: mockToken as Token,
        transactionFee: 100n,
      },
    });

  const hash = shortenWithMiddleEllipsis(
    `${getSnsNeuronIdAsHexString(mockSnsNeuron) ?? ""}`
  );

  it("should render neuron id", () => {
    const { getByTestId } = renderSnsNeuronCmp();

    expect(getByTestId("neuron-id")?.textContent.trim()).toEqual(hash);
  });

  it("should render neuron state", () => {
    const { getByTestId } = renderSnsNeuronCmp();

    expect(getByTestId("neuron-state-info")?.textContent.trim()).toEqual(
      en.neuron_state.Dissolved
    );
  });

  it("should render split neuron button", () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      vesting: false,
    });
    const { getByTestId } = renderSnsNeuronCmp(
      [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT],
      neuron
    );

    expect(getByTestId("split-neuron-button")).toBeInTheDocument();
  });

  it("should hide split neuron button if user doesn't have permission to split", () => {
    const { queryByTestId } = renderSnsNeuronCmp();

    expect(queryByTestId("split-neuron-button")).toBeNull();
  });

  it("should hide split neuron button if neuron is vesting", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      vesting: true,
    });
    const { container } = renderSnsNeuronCmp(
      [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT],
      neuron
    );

    const po = SnsNeuronMetaInfoCardPo.under(
      new JestPageObjectElement(container)
    );

    expect(await po.getVestingPeriod()).toBe("29 days, 10 hours");
  });

  it("should render vesting period if neuron still vesting", async () => {
    const yesterday = BigInt(nowSeconds - SECONDS_IN_DAY);
    const neuronWithPositiveAge: SnsNeuron = {
      ...mockSnsNeuron,
      created_timestamp_seconds: yesterday,
      vesting_period_seconds: [BigInt(SECONDS_IN_MONTH)],
    };

    const { container } = renderSnsNeuronCmp([], neuronWithPositiveAge);

    const po = SnsNeuronMetaInfoCardPo.under(
      new JestPageObjectElement(container)
    );

    expect(await po.isContentLoaded()).toBe(true);
    expect(await po.hasSplitButton()).toBe(false);
  });

  it("should render neuron age if greater than 0", async () => {
    const neuronWithPositiveAge: SnsNeuron = {
      ...mockSnsNeuron,
      aging_since_timestamp_seconds: BigInt(nowSeconds - SECONDS_IN_MONTH),
    };

    const { container } = renderSnsNeuronCmp([], neuronWithPositiveAge);

    const po = SnsNeuronMetaInfoCardPo.under(
      new JestPageObjectElement(container)
    );

    expect(await po.getNeuronAge()).toBe("30 days, 10 hours");
  });

  it("should render not neuron age if lower than 0", async () => {
    const neuronWithAge0: SnsNeuron = {
      ...mockSnsNeuron,
      aging_since_timestamp_seconds: BigInt(nowSeconds + SECONDS_IN_MONTH),
    };

    const { container } = renderSnsNeuronCmp([], neuronWithAge0);

    const po = SnsNeuronMetaInfoCardPo.under(
      new JestPageObjectElement(container)
    );

    expect(await po.hasNeuronAge()).toBe(false);
  });

  const testTitle = async ({
    intersecting,
    text,
  }: {
    intersecting: boolean;
    text: string;
  }) => {
    const { getByTestId } = renderSnsNeuronCmp();

    const element = getByTestId("neuron-id-container") as HTMLElement;

    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    await waitFor(() => expect(title).toEqual(text));
  };

  it("should render a title with neuron ID if title is not intersecting viewport", () =>
    testTitle({ intersecting: false, text: hash }));

  it("should render a static title if title is intersecting viewport", () =>
    testTitle({ intersecting: true, text: en.neuron_detail.title }));
});
