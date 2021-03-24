import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';

import '../dfinity.dart';

import 'stub_ic_api.dart'
    if (dart.library.io) 'platform_ic_api.dart' // dart:io implementation
    if (dart.library.html) 'web_ic_api.dart';


class ICApiManager extends StatefulWidget {

  final Widget child;

  const ICApiManager({Key? key, required this.child}) : super(key: key);

  @override
  _ICApiManagerState createState() => _ICApiManagerState();
}

class _ICApiManagerState extends State<ICApiManager> {

  final PlatformICApi icApi = PlatformICApi();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    icApi.buildServices(context);
  }

  @override
  Widget build(BuildContext context) {
    return InternetComputerApiWidget(child: widget.child, icApi: icApi,);
  }
}

class InternetComputerApiWidget extends InheritedWidget {
  final PlatformICApi icApi;

  InternetComputerApiWidget({
    Key? key,
    required Widget child,
    required this.icApi
  }) : super(key: key, child: child);

  static InternetComputerApiWidget of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<InternetComputerApiWidget>()!;
  }

  @override
  bool updateShouldNotify(InternetComputerApiWidget old) {
    return true;
  }
}


extension ICApiAccess on BuildContext {
  PlatformICApi get icApi => InternetComputerApiWidget.of(this).icApi;
}