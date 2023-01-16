<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";

  // TODO(GIX-1071): this static pre-rendering component should be improved with some more information and shiny design
</script>

<main>
  <h1>{$i18n.auth_accounts.title}</h1>

  <p>
    {$i18n.auth_accounts.text}
  </p>

  <SignIn />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
  }
  h1 {
    line-height: var(--line-height-standard);
  }
  p {
    margin-bottom: var(--padding-3x);
  }
</style>
