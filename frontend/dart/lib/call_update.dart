import 'nns_dapp.dart';

Future<void> _showSessionExpiredAlert(BuildContext context) async {
  return showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext context) {
      return AlertDialog(
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Your session has expired'),
          Text('Please login again'),
        ]),
        elevation: 24.0,
        insetPadding: EdgeInsets.all(28),
        backgroundColor: AppColors.lightBackground,
        actions: <Widget>[
          Container(
            margin: EdgeInsets.all(4),
            child: ElevatedButton(
              child: Container(
                padding: EdgeInsets.fromLTRB(20, 6, 20, 6),
                child: Text('Ok'),
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          )
        ],
      );
    },
  );
}

extension CallUpdate on BuildContext {
  Future<T> callUpdate<T>(Future<T> Function() action) async {
    // If the session times out in 2 minutes, display that the session
    // is expired.
    final timeout = this.icApi.getTimeUntilSessionExpiryMs();
    if (timeout != null && timeout < 120000) {
      await _showSessionExpiredAlert(this);
      this.icApi.logout();
    }
    return await this.performLoading(action);
  }
}
