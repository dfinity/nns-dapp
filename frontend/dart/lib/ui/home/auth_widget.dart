import 'package:nns_dapp/ui/_components/custom_auto_size.dart';

import '../../nns_dapp.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints.expand(),
      decoration: BoxDecoration(
        image: DecorationImage(
            image: AssetImage('assets/nns_background.png'), fit: BoxFit.cover),
      ),
      // color: AppColors.lightBackground,
      child: Stack(
        children: [
          Container(
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.1),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 500),
                child: Column(
                  children: [
                    AutoSizeText(
                      'The Internet Computer',
                      style: context.textTheme.headline1,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 20),
                    AutoSizeText(
                      'Network Nervous System',
                      style: context.textTheme.headline2,
                      textAlign: TextAlign.center,
                    ),
                    Expanded(child: Container()),
                    ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Text(
                            "LOGIN",
                            style: context.textTheme.headline3,
                          ),
                        ),
                        style: ButtonStyle(
                            backgroundColor:
                                MaterialStateProperty.all(AppColors.blue800)),
                        onPressed: () {
                          context.icApi.authenticate(() {
                            context.nav.push(accountsTabPage);
                          });
                        }),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
