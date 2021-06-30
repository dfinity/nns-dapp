import 'package:dfinity_wallet/dfinity.dart';

Future<void> _showSessionExpiredAlert(BuildContext context) async {
  return showDialog<void>(
    context: context,
    barrierDismissible: false, 
    builder: (BuildContext context) {
      return AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
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
                context.icApi.logout();
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
  Future<T?> callUpdate<T>(Future<T> Function() action) async {
    final timeout = this.icApi.getTimeUntilSessionExpiryMs();
    if (timeout < 120000) {// 2 mins
      _showSessionExpiredAlert(this);
      return null;
    }
    return await this.performLoading(action);
  }
}
