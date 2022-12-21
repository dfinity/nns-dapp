<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import BadgeNew from "$lib/components/ui/BadgeNew.svelte";
  import InstallWAppModal from "$lib/modals/canisters/InstallWAppModal.svelte";
  import Footer from "$lib/components/common/Footer.svelte";

  let visible = false;

  const toggleModal = () => (visible = !visible);
</script>

<main>
  <div>
    <p>
      "Wallet Apps" = new blockchain phenomenon coming on Internet Computer. Try
      it now!
    </p>

    <button class="primary" on:click={toggleModal}
      >Install your first wApp</button
    >
  </div>
</main>

{#if visible}
  <InstallWAppModal on:nnsClose={toggleModal} />
{/if}

<Footer columns={1}>
  <button class="primary" on:click={toggleModal}>Install wApp</button>
</Footer>

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }

  h2 {
    margin: var(--padding-2x) 0;
    display: inline-flex;
    align-items: center;
    gap: var(--padding);
  }

  div {
    margin: 0 0 var(--padding-4x);
  }

  p {
    padding: 0 0 var(--padding-2x);
  }
</style>
