<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import { authRemainingTimeStore, authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import {
    Island,
    KeyValuePairInfo,
    SkeletonText,
  } from "@dfinity/gix-components";
  import { nonNullish, secondsToDuration } from "@dfinity/utils";

  let principalText = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  let remainingTimeMilliseconds: number | undefined;
  $: remainingTimeMilliseconds = $authRemainingTimeStore;

  layoutTitleStore.set({
    title: $i18n.navigation.settings,
  });
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
          <div slot="value" class="value session" data-tid="session-duration">
            {#if nonNullish(remainingTimeMilliseconds)}
              {remainingTimeMilliseconds <= 0
                ? "0"
                : secondsToDuration({
                    seconds: BigInt(remainingTimeMilliseconds) / 1000n,
                    i18n: $i18n.time,
                  })}
            {:else}
              <div class="skeleton"><SkeletonText /></div>
            {/if}
          </div>

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
