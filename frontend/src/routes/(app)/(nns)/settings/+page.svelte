<script lang="ts">
    import {Island, KeyValuePairInfo} from "@dfinity/gix-components";
    import Hash from "$lib/components/ui/Hash.svelte";
    import {authRemainingTimeStore, authStore} from "$lib/stores/auth.store";
    import {NANO_SECONDS_IN_MILLISECOND} from "$lib/constants/constants";
    import {secondsToDuration} from "$lib/utils/date.utils";

    let principalText = "";
    $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

    // TODO:
    // - extract component
    // - don't display user menu
    // - back to know referrer only
    // - in another PR: session legth
    // - in another PR: ckTESTBTC feature flag including popover that ask to confirm
    // - public / private route

    let remainingTimeMilliseconds: number;
    $: remainingTimeMilliseconds = ($authRemainingTimeStore ?? 0);
</script>

<Island>
    <main class="legacy">
        <section>
            <h1>Settings</h1>

            <div class="content-cell-details">
                <KeyValuePairInfo>
                    <p slot="key" class="label">Your principal ID</p>
                    <p slot="value" class="value">
                        <Hash id="principal-id" text={principalText} tagName="p" showCopy />
                    </p>

                    <svelte:fragment slot="info">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac tempor diam. Donec varius tincidunt orci ac pellentesque. Maecenas eget dignissim tortor. Quisque pulvinar tincidunt malesuada.
                    </svelte:fragment>
                </KeyValuePairInfo>

                <KeyValuePairInfo>
                    <p slot="key" class="label">Session expires in</p>
                    <p slot="value" class="value">
                        {secondsToDuration(BigInt(remainingTimeMilliseconds) / 1000n)}
                    </p>

                    <svelte:fragment slot="info">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac tempor diam. Donec varius tincidunt orci ac pellentesque. Maecenas eget dignissim tortor. Quisque pulvinar tincidunt malesuada.
                    </svelte:fragment>
                </KeyValuePairInfo>
            </div>
        </section>
    </main>
</Island>