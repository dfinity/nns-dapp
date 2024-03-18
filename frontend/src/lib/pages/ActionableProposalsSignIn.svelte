<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { PageBanner, IconProposalsPage } from "@dfinity/gix-components";
</script>

<PageBanner testId="actionable-proposals-sign-in">
  <IconProposalsPage slot="image" />
  <svelte:fragment slot="title"
    >{$i18n.actionable_proposals_sign_in.title}</svelte:fragment
  >
  <p class="description" slot="description">
    {$i18n.actionable_proposals_sign_in.text}
  </p>
  <SignIn slot="actions" />
</PageBanner>
