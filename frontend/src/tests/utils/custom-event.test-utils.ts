// CustomEvent.detail is a getter rather than a property.
// Because of this, it's not taken into account when vi.expect() checks if two
// events are equal. By overriding CustomEvent with this class, we make sure
// that events are properly compared.
export class CustomEventForTesting<T> extends CustomEvent<T> {
  public readonly type: string;
  public readonly detail: T;

  constructor(type: string, options?: CustomEventInit<T>) {
    super(type, options);
    this.type = type;
    this.detail = options?.detail;
  }
}
