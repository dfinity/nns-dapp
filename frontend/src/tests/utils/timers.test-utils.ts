import { nonNullish } from "@dfinity/utils";

const originalTimeout = setTimeout;

// When awaiting a resolved promise, the code after it doesn't happen
// immediately. This can be confusing in tests if you have expectations based
// on that code. Calling `await runResolvedPromises()` after some async code
// will make sure everything that doesn't depend on future events has already
// executed.
export const runResolvedPromises = () =>
  new Promise((resolve) => originalTimeout(resolve, 0));

// If `millis` is passed, advance time by that much.
// Otherwise advance time enough to run all current timers.
// Execute all resolved promises before and after.
export const advanceTime = async (millis?: number): Promise<void> => {
  // Make sure the timers are set before we advance time.
  await runResolvedPromises();
  if (nonNullish(millis)) {
    await vi.advanceTimersByTimeAsync(millis);
  } else {
    await vi.runOnlyPendingTimersAsync();
  }
  await runResolvedPromises();
};
