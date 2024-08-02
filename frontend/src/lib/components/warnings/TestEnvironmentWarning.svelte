<script lang="ts">
  import { IS_TEST_MAINNET } from "$lib/constants/environment.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import { Html, IconWarning, Modal } from "@dfinity/gix-components";

  let visible = false;
  $: visible = $authSignedInStore && !acknowledged && IS_TEST_MAINNET;

  let acknowledged = false;

  const close = () => (acknowledged = true);
</script>

<Modal
  bind:visible
  role="alert"
  on:nnsClose={close}
  testId="test-env-warning"
  disablePointerEvents={true}
>
  <div class="title" slot="title">
    <span class="icon">
      <IconWarning />
    </span>
    {$i18n.warning.test_env_title}
  </div>

  <p>
    <Html text={$i18n.warning.test_env_note} />
  </p>

  <div class="custom-toolbar">
    <button class="danger" on:click={close} data-tid="test-env-warning-ack"
      >{$i18n.warning.test_env_confirm}</button
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

  p {
    padding: 0 var(--padding);
  }
</style>
