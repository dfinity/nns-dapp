import type { SnsNeuron } from "@dfinity/sns";
import type { RenderResult } from "@testing-library/svelte";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import type { Account } from "../../lib/types/account";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountStore,
} from "../../lib/types/selected-account.context";
import {
  SELECTED_SNS_NEURON_CONTEXT_KEY,
  type SelectedSnsNeuronContext,
  type SelectedSnsNeuronStore,
} from "../../lib/types/sns-neuron-detail.context";
import { getSnsNeuronIdAsHexString } from "../../lib/utils/sns-neuron.utils";
import ContextWrapperTest from "../lib/components/ContextWrapperTest.svelte";
import { rootCanisterIdMock } from "./sns.api.mock";

export const renderContextWrapper = <T>({
  Component,
  contextKey,
  contextValue,
}: {
  Component: typeof SvelteComponent;
  contextKey: symbol;
  contextValue: T;
}): RenderResult =>
  render(ContextWrapperTest, {
    props: {
      contextKey,
      contextValue,
      Component,
    },
  });

export const renderSelectedAccountContext = ({
  Component,
  account,
}: {
  Component: typeof SvelteComponent;
  account: Account | undefined;
}): RenderResult =>
  renderContextWrapper({
    contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
    contextValue: {
      store: writable<SelectedAccountStore>({
        account,
        transactions: undefined,
      }),
    },
    Component,
  });

export const renderSelectedSnsNeuronContext = ({
  Component,
  neuron,
  reload,
}: {
  Component: typeof SvelteComponent;
  neuron: SnsNeuron;
  reload: () => Promise<void>;
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
  });
