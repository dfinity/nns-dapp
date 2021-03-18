import 'package:dfinity_wallet/service/platform_signing_service.dart';

import '../dfinity.dart';

import 'stub_signing_service.dart'
    if (dart.library.io) 'native_signing_service.dart' // dart:io implementation
    if (dart.library.html) 'web_signing_service.dart';

class SigningService extends InheritedWidget {
  final AbstractPlatformSigningService platformSigningService = PlatformSigningService();

  SigningService({
    Key? key,
    required Widget child,
  }) : super(key: key, child: child);

  static SigningService of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<SigningService>()!;
  }

  @override
  bool updateShouldNotify(SigningService old) {
    return true;
  }
}
