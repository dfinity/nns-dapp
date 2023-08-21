<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";

  layoutTitleStore.set({
    title: $i18n.neuron_detail.title,
    header: "",
  });

  // TODO(GIX-1071): this static pre-rendering component should be improved with some more information and shiny design
</script>

<main class="sign-in">
  <h1>{$i18n.auth_neurons.title}</h1>

  <p>
    {$i18n.auth_neurons.text}
  </p>

  <SignIn />
</main>
