// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

class LocalStorageMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] ?? null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    return Object.keys(this.store)[index] ?? null;
  }
}

export default new LocalStorageMock();
