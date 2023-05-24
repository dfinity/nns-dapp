<script lang="ts">
  import { IconWarning, Modal } from "@dfinity/gix-components";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  let visible = false;
  $: visible = $authSignedInStore && !acknowledged;

  let acknowledged = false;

  const close = () => (acknowledged = true);
</script>

<Modal bind:visible role="alert" on:nnsClose={close}>
  <div class="title" slot="title"><IconWarning /> Warning</div>

  <p>Welcome to the Testing Environment.</p>

  <p>
    Please note that you are currently using a <strong>test</strong> version of
    NNS-dapp that operates on the Internet Computer <strong>mainnet</strong>.
    Although it utilizes real data, it is intended solely for testing purposes.
  </p>

  <p>
    We kindly remind you that the functionality and availability of this testing
    dapp may change or even disappear at any time. Therefore, it is crucial to
    refrain from relying on it for any production or critical activities.
  </p>

  <div class="custom-toolbar">
    <button class="primary" on:click={close}
      >I understand and want to continue</button
    >
  </div>
</Modal>

<style lang="scss">
  .title {
    display: inline-flex;
    align-items: center;
    gap: var(--padding);
  }

  .custom-toolbar {
    display: flex;
    justify-content: center;
    padding: var(--padding-2x) 0 var(--padding);
  }
</style>
