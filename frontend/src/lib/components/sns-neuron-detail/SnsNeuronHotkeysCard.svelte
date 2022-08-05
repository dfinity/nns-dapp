<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import { ICON_SIZE_LARGE } from "../../constants/style.constants";
  import IconClose from "../../icons/IconClose.svelte";
  import IconInfo from "../../icons/IconInfo.svelte";
  import IconWarning from "../../icons/IconWarning.svelte";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
  import {
    getSnsNeuronHotkeys,
    canIdentityManageHotkeys,
  } from "../../utils/sns-neuron.utils";
  import CardInfo from "../ui/CardInfo.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import Value from "../ui/Value.svelte";
  import AddSnsHotkeyButton from "./actions/AddSnsHotkeyButton.svelte";

  export let neuron: SnsNeuron;

  let canManageHotkeys: boolean = true;
  $: canManageHotkeys = canIdentityManageHotkeys({
    neuron,
    identity: $authStore.identity,
  });
  let hotkeys: string[];
  $: hotkeys = getSnsNeuronHotkeys(neuron);

  let showTooltip: boolean;
  $: showTooltip = hotkeys.length > 0 && canManageHotkeys;

  const remove = async (hotkey: string) => {
    // TODO: https://dfinity.atlassian.net/browse/L2-910
    console.log("Removing", hotkey);
  };
</script>

<CardInfo testId="sns-hotkeys-card">
  <div class="title" slot="start">
    <h3>{$i18n.neuron_detail.hotkeys_title}</h3>
    {#if showTooltip}
      <Tooltip
        id="sns-hotkeys-info"
        text={$i18n.sns_neuron_detail.add_hotkey_tooltip}
      >
        <span>
          <IconInfo />
        </span>
      </Tooltip>
    {/if}
  </div>
  {#if hotkeys.length === 0}
    <div class="warning">
      <span class="icon"><IconWarning size={ICON_SIZE_LARGE} /></span>
      <p class="description">{$i18n.sns_neuron_detail.add_hotkey_info}</p>
    </div>
  {:else}
    <ul>
      {#each hotkeys as hotkey (hotkey)}
        <li>
          <Value>{hotkey}</Value>
          {#if canManageHotkeys}
            <button
              class="text"
              aria-label={$i18n.core.remove}
              on:click={() => remove(hotkey)}
              data-tid="remove-hotkey-button"><IconClose size="18px" /></button
            >
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  {#if canManageHotkeys}
    <div class="actions">
      <AddSnsHotkeyButton />
    </div>
  {/if}
</CardInfo>

<style lang="scss">
  @use "../../themes/mixins/card";
  .title {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }

  .warning {
    display: grid;
    grid-template-columns: var(--icon-size-large) 1fr;
    gap: var(--padding-2x);

    margin-bottom: var(--padding-2x);

    .icon {
      color: var(--warning-emphasis);
    }

    p {
      margin: 0;
    }
  }

  ul {
    @include card.list;
  }

  li {
    @include card.list-item;

    button {
      display: flex;
    }
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }
</style>
