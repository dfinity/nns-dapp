<script lang="ts">
  import Copy from "$lib/components/ui/Copy.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconKey, Input } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { SubAccount } from "@icp-sdk/canisters/ledger/icp";
  import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
  import { Principal } from "@icp-sdk/core/principal";

  let principalInput = $state("");
  let subAccountInput = $state("");
  let hexOutput = $state<null | string>(null);
  let errorMessage = $state<null | string>(null);

  $effect(() => {
    if (principalInput === "" || subAccountInput === "") return;

    try {
      const owner = Principal.fromText(principalInput.trim());
      const subaccount = SubAccount.fromID(Number(subAccountInput));

      const icrc = encodeIcrcAccount({
        owner,
        subaccount: subaccount.toUint8Array(),
      });

      hexOutput = icrc;
      errorMessage = null;
    } catch (e) {
      errorMessage = e instanceof Error ? e?.message : "An error occurred";
      hexOutput = null;
    }
  });
</script>

<div class="util-form">
  <div class="util-header">
    <div class="util-icon">
      <IconKey size="20" />
    </div>
    <div class="util-title">{$i18n.alfred.build_icrc_account_title}</div>
  </div>
  <div class="util-fields">
    <div class="util-field">
      <label for="alfred-util-principal"
        >{$i18n.alfred.build_icrc_account_principal_label}</label
      >
      <Input
        inputType="text"
        name="alfred-util-principal"
        placeholder="Enter principal"
        autocomplete="off"
        spellcheck={false}
        testId="alfred-util-principal"
        bind:value={principalInput}
      />
    </div>
    <div class="util-field">
      <label for="alfred-util-subaccount"
        >{$i18n.alfred.build_icrc_account_subaccount_label}</label
      >
      <Input
        inputType="text"
        name="alfred-util-subaccount"
        placeholder="Enter subaccount (optional)"
        autocomplete="off"
        spellcheck={false}
        testId="alfred-util-subaccount"
        bind:value={subAccountInput}
      />
    </div>
    <div class="util-output">
      <div class="hex-value-container">
        {#if nonNullish(errorMessage)}
          <div class="error-message">{errorMessage}</div>
        {:else if nonNullish(hexOutput)}
          <div class="hex-value" data-tid="alfred-util-hex-output"
            >{hexOutput || ""}</div
          >
          <Copy value={hexOutput} />
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .util-form {
    padding: var(--padding-3x);
    background: var(--overlay-content-background);
    color: var(--overlay-content-background-contrast);

    .util-header {
      display: flex;
      align-items: center;
      gap: var(--padding-2x);
      margin-bottom: var(--padding-3x);

      .util-icon {
        width: var(--padding-4x);
        height: var(--padding-4x);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary);
        flex-shrink: 0;
        border-radius: var(--padding);
        background: var(--background-secondary, rgba(0, 0, 0, 0.05));
      }

      .util-title {
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-lg);
        color: var(--text-color);
      }
    }

    .util-fields {
      display: flex;
      flex-direction: column;
      gap: var(--padding-2x);

      .util-field {
        display: flex;
        flex-direction: column;
        gap: var(--padding);

        label {
          font-weight: var(--font-weight-medium);
          color: var(--text-color);
          @include fonts.small();
        }

        --input-width: 100%;
      }

      .util-output {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
        margin-top: var(--padding);

        .hex-value-container {
          display: flex;
          align-items: center;
          gap: var(--padding);
        }

        .hex-value {
          flex: 1;
          padding: var(--padding-2x);
          background: var(--background-secondary, rgba(0, 0, 0, 0.05));
          border-radius: var(--border-radius);
          font-family: monospace;
          word-break: break-all;
          color: var(--text-color);
          @include fonts.small();
          line-height: 1.5em;
        }

        .error-message {
          padding: var(--padding) var(--padding-2x);
          background: var(--background-secondary, rgba(0, 0, 0, 0.05));
          border-radius: var(--border-radius);
          color: var(--negative-emphasis);
          @include fonts.small();
          line-height: 1.5em;
          word-break: break-word;
        }
      }
    }
  }
</style>
