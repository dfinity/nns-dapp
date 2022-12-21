<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher, getContext } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { installCode } from "$lib/services/canisters.services";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import {
    INSTALL_WAPP_CONTEXT_KEY,
    type InstallWAppContext,
  } from "$lib/types/install-wapp.context";

  const { store, back }: InstallWAppContext = getContext<InstallWAppContext>(
    INSTALL_WAPP_CONTEXT_KEY
  );

  const dispatcher = createEventDispatcher();

  const onSubmit = async () => {
    startBusy({ initiator: "install-wapp" });

    const canisterId = $store.canisterId;

    const { success } = await installCode({
      blob: $store.file,
      canisterId,
      hash: $store.hash,
    });

    if (success) {
      toastsSuccess({
        labelKey: "canisters.reinstall_canister_success",
        substitutions: {
          $canisterId: canisterId.toText(),
        },
      });

      dispatcher("nnsClose");
    }

    stopBusy("install-wapp");
  };
</script>

<form on:submit|preventDefault={onSubmit} class="form">
  <div>
    <p class="label">{$i18n.canisters.source}</p>
    <p class="value">
      {$store.file?.name ?? ""}
    </p>
  </div>

  <div>
    <p class="label">{$i18n.canisters.destination}</p>
    <p class="value">
      {$store.canisterId.toText()}
    </p>
  </div>

  <div>
    <p class="label">{$i18n.canisters.hash}</p>
    <p class="value">
      {$store.hash}
    </p>
  </div>

  <div>
    <p class="label">{$i18n.canisters.mode}</p>
    <p class="value">
      {$i18n.canisters.reinstall}
      {$i18n.canisters.insecure}
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
