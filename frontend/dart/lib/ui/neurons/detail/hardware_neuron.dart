import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:universal_html/js_util.dart';
import 'package:universal_html/js.dart' as js;
import '../../../dfinity.dart';

class HardwareWalletNeuron extends StatefulWidget {
  final NeuronId neuronId;
  final ICP amount;
  final Function(BuildContext context) onAddHotkey;
  final Function(BuildContext context) onSkip;

  const HardwareWalletNeuron(
      {Key? key,
      required this.neuronId,
      required this.amount,
      required this.onAddHotkey,
      required this.onSkip})
      : super(key: key);

  @override
  _HardwareWalletNeuronState createState() => _HardwareWalletNeuronState();
}

class _HardwareWalletNeuronState extends State<HardwareWalletNeuron> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(
                        top: 42.0, left: 42.0, right: 42.0, bottom: 20.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Neuron ID',
                                style: Responsive.isMobile(context)
                                    ? context.textTheme.headline4
                                    : context.textTheme.headline3),
                            VerySmallFormDivider(),
                            Text(
                              widget.neuronId.toString(),
                              style: Responsive.isMobile(context)
                                  ? context.textTheme.bodyText2!
                                      .copyWith(fontSize: 16)
                                  : context.textTheme.bodyText1!
                                      .copyWith(fontSize: 24),
                            ),
                            TallFormDivider(),
                            Text('Balance',
                                style: Responsive.isMobile(context)
                                    ? context.textTheme.headline4
                                    : context.textTheme.headline3),
                            VerySmallFormDivider(),
                            RichText(
                                text: TextSpan(
                                    text: widget.amount.asString(),
                                    style: Responsive.isMobile(context)
                                        ? context.textTheme.bodyText2
                                        : context.textTheme.bodyText1!
                                            .copyWith(fontSize: 24),
                                    children: [
                                  TextSpan(
                                    text: " ICP",
                                    style: Responsive.isMobile(context)
                                        ? context.textTheme.bodyText2
                                        : context.textTheme.bodyText1!
                                            .copyWith(fontSize: 20),
                                  )
                                ])),
                            TallFormDivider(),
                          ],
                        ),
                        Divider(height: 30.0),
                        Text(
                          'To see and manage this neuron in the NNS app, '
                          'please add the NNS app as a hotkey.\n\nYour principal '
                          'on the NNS app is:\n${context.icApi.getPrincipal()}',
                          style: Responsive.isMobile(context)
                              ? context.textTheme.bodyText2
                              : context.textTheme.bodyText1!
                                  .copyWith(fontSize: 25),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        Container(
          width: double.infinity,
          color: AppColors.lightBackground,
          height: 100,
          padding: Responsive.isMobile(context)
              ? EdgeInsets.symmetric(horizontal: 30, vertical: 16)
              : EdgeInsets.symmetric(horizontal: 64, vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ButtonStyle(
                      backgroundColor:
                          MaterialStateProperty.all(AppColors.gray500)),
                  child: Text(
                    'Skip',
                    style: TextStyle(
                        fontSize: Responsive.isMobile(context) ? 14 : 16),
                  ),
                  onPressed: () async {
                    widget.onSkip(context);
                  },
                ),
              ),
              SizedBox(
                width: 10,
              ),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                    child: Text(
                      "Add NNS app as hotkey",
                      style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 16),
                    ),
                    onPressed: () async {
                      final ledgerIdentity =
                          await context.icApi.connectToHardwareWallet();
                      final hwApi = await context.icApi.createHardwareWalletApi(
                          ledgerIdentity: ledgerIdentity);
                      try {
                        await context.callUpdate(() => promiseToFuture(
                            hwApi.addHotKey(widget.neuronId.toString(),
                                context.icApi.getPrincipal())));
                        await context.icApi.refreshNeurons();

                        widget.onAddHotkey(context);
                      } catch (err) {
                        // Error occurred adding hotkey. Display the error.
                        js.context.callMethod("alert", ["$err"]);
                      }
                    }),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
