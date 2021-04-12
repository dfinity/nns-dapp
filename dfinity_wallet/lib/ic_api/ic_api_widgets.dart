import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';

import '../dfinity.dart';

import 'stub_ic_api.dart'
    if (dart.library.io) 'platform_ic_api.dart' // dart:io implementation
    if (dart.library.html) 'web/web_ic_api.dart';


class ICApiManager extends StatefulWidget {

  final Widget child;
  final AbstractPlatformICApi? icApi;

  const ICApiManager({Key? key, required this.child, this.icApi}) : super(key: key);

  @override
  ICApiManagerState createState() => ICApiManagerState();
}

class ICApiManagerState extends State<ICApiManager>{

  AbstractPlatformICApi? icApi;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if(icApi == null){
      icApi = PlatformICApi(context.boxes);
    }
  }

  @override
  Widget build(BuildContext context) {
    return InternetComputerApiWidget(icApi: icApi!, child: widget.child,);
  }
}

class InternetComputerApiWidget extends InheritedWidget {
  final AbstractPlatformICApi icApi;

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
  AbstractPlatformICApi get icApi => InternetComputerApiWidget.of(this).icApi;
}