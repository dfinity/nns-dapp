import { loadIdentity } from "$lib/utils/auth.utils";
import type { Identity } from "@dfinity/agent";

export interface WorkerTimerParams<T> {
  job: (params: WorkerTimerJobData<T>) => Promise<void>;
  data: T;
}
export type WorkerTimerJobData<T> = { data: T } & WorkerTimerSyncParams;

export interface WorkerTimerSyncParams {
  identity: Identity;
}

export class WorkerTimer {
  private timer: NodeJS.Timeout | undefined = undefined;
  private syncStatus: "idle" | "in_progress" | "error" = "idle";

  async start<T>({
    interval,
    ...rest
  }: WorkerTimerParams<T> & { interval: number }): Promise<void> {
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
  }: WorkerTimerParams<T> & WorkerTimerSyncParams): Promise<void> {
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
