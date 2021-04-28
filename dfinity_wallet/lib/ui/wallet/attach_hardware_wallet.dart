import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';

import '../../dfinity.dart';

class AttachHardwareWalletWidget extends StatefulWidget {
  @override
  _AttachHardwareWalletWidgetState createState() => _AttachHardwareWalletWidgetState();
}

class _AttachHardwareWalletWidgetState extends State<AttachHardwareWalletWidget> {
  ValidatedTextField nameField = ValidatedTextField("Hardware Wallet Name",
      validations: [StringFieldValidation.minimumLength(2)]);

  @override
  Widget build(BuildContext context) {
    return Padding (
      padding: const EdgeInsets.all(32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Center(
            child: FractionallySizedBox(
              widthFactor: 0.7,
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("Name", style: context.textTheme.headline3),
                      DebouncedValidatedFormField(nameField),
                    ],
                  ),
                ),
              ),
            ),
          ),
          TallFormDivider(),
          CircularProgressWidget(),
          TextButton(child: Text("Connect"), onPressed: () {

          }),
          Expanded(child: Container()),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text("Attach Wallet"),
                onPressed: () async {},
                fields: [nameField],
              ))
        ],
      ),
    );
  }
}

class CircularProgressWidget extends StatefulWidget {
  const CircularProgressWidget({Key? key}) : super(key: key);

  @override
  _CircularProgressWidgetState createState() => _CircularProgressWidgetState();
}

class _CircularProgressWidgetState extends State<CircularProgressWidget>
    with TickerProviderStateMixin {
  late AnimationController controller;

  @override
  void initState() {
    controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..addListener(() {
        setState(() {});
      });
    controller.repeat();
    super.initState();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CircularProgressIndicator(
      value: controller.value,
    );
  }
}
