<script lang="ts">
  import {
    Island,
    KeyValuePairInfo,
    SkeletonText,
  } from "@dfinity/gix-components";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { authRemainingTimeStore, authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { debounce, nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";

  let principalText = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  let remainingTimeMilliseconds: number | undefined;
  $: remainingTimeMilliseconds = $authRemainingTimeStore;

  // Defer the title to avoid a visual glitch where the title moves from left to center in the header if navigation happens from Accounts page
  onMount(debounce(() => layoutTitleStore.set($i18n.navigation.settings), 500));
</script>

<Island>
  <main class="legacy">
    <section>
      <div class="content-cell-details">
        <KeyValuePairInfo>
          <p slot="key" class="label">{$i18n.settings.your_principal}</p>
          <p slot="value" class="value principal">
            <Hash
              id="principal-id"
              text={principalText}
              tagName="p"
              className="value"
              showCopy
            />
          </p>

          <svelte:fragment slot="info">
            {$i18n.settings.your_principal_description}
          </svelte:fragment>
        </KeyValuePairInfo>

        <KeyValuePairInfo>
          <p slot="key" class="label">{$i18n.settings.your_session}</p>
          <p slot="value" class="value session" data-tid="session-duration">
            {#if nonNullish(remainingTimeMilliseconds)}
              {remainingTimeMilliseconds <= 0
                ? "0"
                : secondsToDuration(BigInt(remainingTimeMilliseconds) / 1000n)}
            {:else}
              <div class="skeleton"><SkeletonText /></div>
            {/if}
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
    margin: 0;
  }

  .skeleton {
    width: calc(var(--padding) * 10);
  }
</style>
