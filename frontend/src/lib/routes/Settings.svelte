<script lang="ts">
  import { Island, KeyValuePairInfo } from "@dfinity/gix-components";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { authRemainingTimeStore, authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";

  let principalText = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  let remainingTimeMilliseconds: number;
  $: remainingTimeMilliseconds = $authRemainingTimeStore ?? 0;
</script>

<Island>
  <main class="legacy">
    <section>
      <h1>{$i18n.navigation.settings}</h1>

      <div class="content-cell-details">
        <KeyValuePairInfo>
          <p slot="key" class="label">{$i18n.settings.your_principal}</p>
          <p slot="value" class="value principal">
            <Hash id="principal-id" text={principalText} tagName="p" showCopy />
          </p>

          <svelte:fragment slot="info">
            {$i18n.settings.your_principal_description}
          </svelte:fragment>
        </KeyValuePairInfo>

        <KeyValuePairInfo>
          <p slot="key" class="label">{$i18n.settings.your_session}</p>
          <p slot="value" class="value session">
            {secondsToDuration(BigInt(remainingTimeMilliseconds) / 1000n)}
          </p>

          <svelte:fragment slot="info">
            {$i18n.settings.your_session_description}
          </svelte:fragment>
        </KeyValuePairInfo>
      </div>
    </section>
  </main>
</Island>

<style lang="scss">
  .content-cell-details {
    gap: var(--padding-0_5x);
  }
  .principal {
    margin: 0;
  }

  .session {
    padding-right: var(--padding);
  }
</style>
