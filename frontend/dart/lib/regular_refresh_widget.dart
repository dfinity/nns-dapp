import 'dart:async';

import 'dfinity.dart';

class RegularRefreshWidget extends StatefulWidget {
  final Function performRefresh;
  final Widget child;
  RegularRefreshWidget({Key? key, required this.performRefresh, required this.child}) : super(key: key);

  @override
  _RegularRefreshWidgetState createState() => _RegularRefreshWidgetState();
}

class _RegularRefreshWidgetState extends State<RegularRefreshWidget> {

  late Timer timer;

  @override
  void initState() {
    super.initState();
    timer = Timer.periodic(10.seconds, (timer) {
      widget.performRefresh();
    });
    widget.performRefresh();
  }

  @override
  void dispose() {
    super.dispose();
    timer.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
