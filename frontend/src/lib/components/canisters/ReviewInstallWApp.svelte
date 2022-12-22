<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { installWApp } from "$lib/services/canisters.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import {
    INSTALL_WAPP_CONTEXT_KEY,
    type InstallWAppContext,
  } from "$lib/types/install-wapp.context";
  import TransactionSource from "$lib/modals/accounts/NewTransaction/TransactionSource.svelte";
  import InstallWAppAmount from "$lib/components/canisters/InstallWAppAmount.svelte";

  const { store, back }: InstallWAppContext = getContext<InstallWAppContext>(
    INSTALL_WAPP_CONTEXT_KEY
  );

  const dispatcher = createEventDispatcher();

  const onSubmit = async () => {
    startBusy({ initiator: "install-wapp" });

    const { install, canisterId } = await installWApp($store);

    // We cannot have success without canisterId
    if (install === "success" && canisterId !== undefined) {
      toastsSuccess({
        labelKey: "canisters.install_wapp_success",
        substitutions: {
          $canisterId: canisterId.toText(),
        },
      });
    }

    // We close the modal in any case
    dispatcher("nnsWAppInstalled");

    stopBusy("install-wapp");
  };
</script>

<form on:submit|preventDefault={onSubmit} class="form">
  {#if $store.account !== undefined}
    <TransactionSource account={$store.account} />
  {/if}

  <p class="description">
    <InstallWAppAmount />
  </p>

  <div>
    <p class="label">{$i18n.canisters.source_file}</p>
    <p class="value">
      {$store.file?.name ?? ""}
    </p>
  </div>

  <div class="toolbar">
    <button class="secondary" type="button" on:click={back}>
      {$i18n.core.back}
    </button>

    <button type="submit" class="primary">
      {$i18n.canisters.execute}
    </button>
  </div>
</form>

<style lang="scss">
  .form {
    gap: var(--padding);
  }

  p {
    word-break: break-word;
  }
</style>
