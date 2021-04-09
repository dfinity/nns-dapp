extension ToBigInt on String {
  BigInt get toBigInt => BigInt.tryParse(this) ?? BigInt.from(-1);
}