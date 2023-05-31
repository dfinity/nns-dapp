<script lang="ts">
  import { Html, IconWarning, Modal } from "@dfinity/gix-components";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { IS_TEST_MAINNET } from "$lib/constants/environment.constants";
  import { i18n } from "$lib/stores/i18n";

  let visible = false;
  $: visible = $authSignedInStore && !acknowledged && IS_TEST_MAINNET;

  let acknowledged = false;

  const close = () => (acknowledged = true);
</script>

<Modal bind:visible role="alert" on:nnsClose={close} testId="test-env-warning" disablePointerEvents={true}>
  <div class="title" slot="title"><IconWarning /> {$i18n.warning.test_env_title}</div>

  <p>{$i18n.warning.test_env_welcome}</p>

  <p>
    <Html text={$i18n.warning.test_env_note} />
  </p>

  <p>
    {$i18n.warning.test_env_request}
  </p>

  <div class="custom-toolbar">
    <button class="primary" on:click={close} data-tid="test-env-warning-ack"
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
</style>
