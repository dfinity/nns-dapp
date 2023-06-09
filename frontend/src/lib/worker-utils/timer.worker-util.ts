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
  private timerStatus: "idle" | "in_progress" | "error" = "idle";

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

    const execute = async () => await this.executeJob<T>({ identity, ...rest });

    // We sync the cycles now but also schedule the update after wards
    await execute();

    this.timer = setInterval(execute, interval);
  }

  private async executeJob<T>({
    job,
    ...rest
  }: TimerWorkerUtilParams<T> & TimerWorkerUtilSyncParams): Promise<void> {
    // Avoid to sync if already in progress - do not duplicate calls - or if there was a previous error
    if (this.timerStatus !== "idle") {
      return;
    }

    this.timerStatus = "in_progress";

    try {
      await job({ ...rest });

      this.timerStatus = "idle";
    } catch (err: unknown) {
      console.error(err);

      // Once the status becomes "error", the job will no longer be called and the status will remain "error"
      this.timerStatus = "error";

      // Because it will no longer be called, we can stop it too
      this.stop();
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
