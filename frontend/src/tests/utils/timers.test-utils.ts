import { nonNullish } from "@dfinity/utils";

const originalTimeout = setTimeout;

export const runResolvedPromises = () =>
  new Promise((resolve) => originalTimeout(resolve, 0));

// If `millis` is passed, advance time by that much.
// Otherwise advance time enough to run all current timers.
// Execute all resolved promises before and after.
export const advanceTime = async (millis?: number): Promise<void> => {
  // Make sure the timers are set before we advance time.
  await runResolvedPromises();
  if (nonNullish(millis)) {
    jest.advanceTimersByTime(millis);
  } else {
    jest.runOnlyPendingTimers();
  }
  await runResolvedPromises();
};
