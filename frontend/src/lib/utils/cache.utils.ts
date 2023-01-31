import { CACHE_EXPIRATION_MILLISECONDS } from "$lib/constants/cache.constants";

type CachedResponse<R> = {
  response: R;
  certified: boolean;
};

type CachedData<R> = CachedResponse<R> & {
  timestampMilliseconds: number;
};

export class ResponseCache<T> {
  private certifiedData: CachedData<T> | undefined;
  private uncertifiedData: CachedData<T> | undefined;

  constructor(
    private cacheExpirationMilliseconds: number = CACHE_EXPIRATION_MILLISECONDS
  ) {}

  getCertifiedData(): T | undefined {
    if (this.isExpired(this.certifiedData)) {
      this.certifiedData = undefined;
      return;
    }
    return this.certifiedData?.response;
  }

  getUncertifiedData(): T | undefined {
    if (this.isExpired(this.uncertifiedData)) {
      this.uncertifiedData = undefined;
      return;
    }
    return this.uncertifiedData?.response;
  }

  set(value: CachedResponse<T>): void {
    const data: CachedData<T> = {
      ...value,
      timestampMilliseconds: Date.now(),
    };
    if (value.certified) {
      this.certifiedData = data;
    } else {
      this.uncertifiedData = data;
    }
  }

  reset(certified: boolean): void {
    if (certified) {
      this.certifiedData = undefined;
    }
    this.uncertifiedData = undefined;
  }

  private isExpired(data: CachedData<T> | undefined): boolean {
    return (
      Date.now() - (data?.timestampMilliseconds ?? 0) >
      this.cacheExpirationMilliseconds
    );
  }
}
