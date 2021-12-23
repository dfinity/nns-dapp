import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../nns_dapp.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        constraints: BoxConstraints.expand(),
        decoration: BoxDecoration(
          image: DecorationImage(
              image: AssetImage('assets/nns_background.jpeg'),
              fit: BoxFit.cover),
        ),
        child: Container(
          padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.1),
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 500),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'INTERNET COMPUTER',
                    style: TextStyle(
                      fontSize: Responsive.isMobile(context) ? 16 : 20,
                      fontFamily: Fonts.circularBold,
                      color: AppColors.gray400,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 10,
                    ),
                  ),
                  SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'NETWORK',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularBold,
                          color: AppColors.blue350,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 8,
                        ),
                      ),
                      Text(
                        ' .  ',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularBold,
                          color: AppColors.gray400,
                        ),
                      ),
                      Text(
                        'NERVOUS',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularBold,
                          color: AppColors.pink,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 8,
                          wordSpacing: 0,
                        ),
                      ),
                      Text(
                        ' .  ',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularBold,
                          color: AppColors.gray400,
                        ),
                      ),
                      Text(
                        'SYSTEM',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularBold,
                          color: AppColors.green400,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 8,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  SvgPicture.asset("assets/ic_colour_logo.svg"),
                  Expanded(child: Container()),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'ICP',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularMedium,
                          color: AppColors.green400,
                          fontWeight: FontWeight.w400,
                          letterSpacing: 5,
                        ),
                      ),
                      Text(
                        ' and ',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularMedium,
                          color: AppColors.gray400,
                          fontWeight: FontWeight.w400,
                          letterSpacing: 5,
                        ),
                      ),
                      Text(
                        'governance',
                        style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 18,
                          fontFamily: Fonts.circularMedium,
                          color: AppColors.blue350,
                          fontWeight: FontWeight.w400,
                          letterSpacing: 5,
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Text(
                            "LOGIN",
                            style: TextStyle(
                              fontSize: Responsive.isMobile(context) ? 16 : 20,
                              fontFamily: Fonts.circularBold,
                              color: AppColors.gray400,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 8,
                            ),
                          ),
                        ),
                        style: ButtonStyle(
                            backgroundColor: MaterialStateProperty.all(
                          AppColors.blue950,
                        )),
                        onPressed: () {
                          context.icApi.authenticate(() {
                            context.nav.push(accountsTabPage);
                          });
                        }),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
