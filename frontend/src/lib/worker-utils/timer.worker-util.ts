import { loadIdentity } from "$lib/utils/auth.utils";
import type { Identity } from "@dfinity/agent";

export interface TimerWorkerUtilParams<T> {
  job: (params: TimerWorkerUtilJobData<T>) => Promise<void>;
  data: T;
}
export type TimerWorkerUtilJobData<T> = { data: T } & TimerWorkerUtilSyncParams;

export interface TimerWorkerUtilSyncParams {
  identity: Identity;
}

export class TimerWorkerUtil {
  private timer: NodeJS.Timeout | undefined = undefined;
  private syncStatus: "idle" | "in_progress" | "error" = "idle";

  async start<T>({
    interval,
    ...rest
  }: TimerWorkerUtilParams<T> & { interval: number }): Promise<void> {
    // This worker has already been started
    if (this.timer !== undefined) {
      return;
    }

    const identity: Identity | undefined = await loadIdentity();

    if (!identity) {
      // We do nothing if no identity
      return;
    }

    const sync = async () => await this.executeSync<T>({ identity, ...rest });

    // We sync the cycles now but also schedule the update afterwards
    await sync();

    this.timer = setInterval(sync, interval);
  }

  private async executeSync<T>({
    job,
    ...rest
  }: TimerWorkerUtilParams<T> & TimerWorkerUtilSyncParams): Promise<void> {
    // Avoid to sync if already in progress - do not duplicate calls - or if there was a previous error
    if (this.syncStatus !== "idle") {
      return;
    }

    this.syncStatus = "in_progress";

    try {
      await job({ ...rest });

      this.syncStatus = "idle";
    } catch (err: unknown) {
      console.error(err);

      // Once the status becomes "error", the job will no longer be called and the status will remain "error"
      this.syncStatus = "error";
    }
  }

  stop(cleanup?: () => void) {
    this.stopTimer();
    cleanup?.();
  }

  private stopTimer() {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = undefined;
  }
}
