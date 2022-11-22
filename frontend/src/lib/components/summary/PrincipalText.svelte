<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { authStore } from "$lib/stores/auth.store";

  export let inline = false;

  let principalText = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";
</script>

<p class="value principal" class:inline>
  <span>{$i18n.core.principal_is}</span>
  <Hash id="neuron-id" text={principalText} tagName="p" />
</p>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .principal {
    display: flex;
    flex-direction: column;
    margin: var(--padding-0_25x) 0 var(--padding-2x);

    &.inline {
      display: inline-block;
      margin: 0;
    }

    span {
      color: var(--description-color);
      @include fonts.small;
    }
  }
</style>
