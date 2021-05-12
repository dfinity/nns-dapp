import 'package:dfinity_wallet/dfinity.dart';

extension CallUpdate on BuildContext {
  Future<T?> callUpdate<T>(Future<T> Function() action) async {
    final timeout = this.icApi.getTimeUntilSessionExpiryMs();
    if (timeout < 120000) {// 2 mins
      this.icApi.logout();
      return null;
    }
    return await this.performLoading(action);
  }
}
