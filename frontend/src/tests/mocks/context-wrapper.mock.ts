import type { Account } from "$lib/types/account";
import {
  SELECTED_SNS_NEURON_CONTEXT_KEY,
  type SelectedSnsNeuronContext,
  type SelectedSnsNeuronStore,
} from "$lib/types/sns-neuron-detail.context";
import {
  WALLET_CONTEXT_KEY,
  type WalletStore,
} from "$lib/types/wallet.context";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render } from "$tests/utils/svelte.test-utils";
import type { SnsNeuron } from "@dfinity/sns";
import type { RenderResult } from "@testing-library/svelte";
import type { Component } from "svelte";
import { writable } from "svelte/store";

export const renderContextWrapper = <T>({
  Component,
  contextKey,
  contextValue,
  props,
  events,
}: {
  Component: Component;
  contextKey: symbol;
  contextValue: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any;
  events?: Record<string, ($event: CustomEvent) => void>;
}): RenderResult<Component> =>
  render(ContextWrapperTest, {
    props: {
      contextKey,
      contextValue,
      Component,
      props,
    },
    events,
  });

export const renderSelectedAccountContext = ({
  Component,
  account,
}: {
  Component: Component;
  account: Account | undefined;
}): RenderResult<Component> =>
  renderContextWrapper({
    contextKey: WALLET_CONTEXT_KEY,
    contextValue: {
      store: writable<WalletStore>({
        account,
        neurons: [],
      }),
    },
    Component,
  });

export const renderSelectedSnsNeuronContext = ({
  Component,
  neuron,
  reload,
  props,
  events,
}: {
  Component: Component;
  neuron: SnsNeuron;
  reload: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any;
  events?: Record<string, ($event: CustomEvent) => void>;
}) =>
  renderContextWrapper({
    Component,
    contextKey: SELECTED_SNS_NEURON_CONTEXT_KEY,
    contextValue: {
      store: writable<SelectedSnsNeuronStore>({
        selected: {
          neuronIdHex: getSnsNeuronIdAsHexString(neuron),
          rootCanisterId: rootCanisterIdMock,
        },
        neuron,
      }),
      reload,
    } as SelectedSnsNeuronContext,
    props,
    events,
  });
