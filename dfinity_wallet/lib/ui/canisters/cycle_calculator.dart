class CycleCalculator {
  static const ICP_IN_CYCLE = 0.002380952381;

  static double icpToCycles(double icp) {
    final cycleToICP = (1 / ICP_IN_CYCLE).round();
    return icp * cycleToICP;
  }

  static double cyclesToIcp(double cycles) {
    return (cycles.toInt() * ICP_IN_CYCLE);
  }
}
