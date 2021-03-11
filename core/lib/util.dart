T logTime<T>(String description, T Function() func) {
  final stopwatch = Stopwatch()..start();
  var output = func();
  print('$description in ${stopwatch.elapsed}');
  stopwatch.stop();
  return output;
}
