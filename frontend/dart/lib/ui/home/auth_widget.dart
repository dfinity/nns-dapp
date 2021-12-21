import '../../nns_dapp.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // If we were about to render the flutter login page, call logout() which navigates to /v2 when finished.
    // Note: Navigating directly to v2 here is unreliable as logout may not have completed yet.
    context.icApi.logout();
    return Container(
      constraints: BoxConstraints.expand(),
      decoration: BoxDecoration(
        image: DecorationImage(
            image: AssetImage('assets/nns_background.jpeg'), fit: BoxFit.cover),
      ),
    );
  }
}
