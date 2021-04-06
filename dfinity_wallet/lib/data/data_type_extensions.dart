extension ToBigInt on String {
  BigInt get toBigInt => BigInt.parse(this);
}