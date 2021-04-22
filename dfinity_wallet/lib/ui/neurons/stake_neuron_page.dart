import 'package:dfinity_wallet/data/icp_source.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:uuid/uuid.dart';

import '../../dfinity.dart';
import 'package:dartx/dartx.dart';
import 'dart:math';

class StakeNeuronPage extends StatefulWidget {
  final ICPSource source;

  const StakeNeuronPage({Key? key, required this.source}) : super(key: key);

  @override
  _StakeNeuronPageState createState() => _StakeNeuronPageState();
}

class _StakeNeuronPageState extends State<StakeNeuronPage> {
  late ValidatedTextField amountField;

  @override
  void initState() {
    amountField = ValidatedTextField("Amount in ICP",
        validations: [
          FieldValidation("Not enough ICP",
              (e) => (e.toIntOrNull() ?? 0) > widget.source.icpBalance),
          FieldValidation(
              "Must be greater than 0", (e) => (e.toIntOrNull() ?? 0) == 0)
        ],
        inputType: TextInputType.number);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IntrinsicWidth(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TallFormDivider(),
                        SelectableText("Origin", style: context.textTheme.headline4),
                        VerySmallFormDivider(),
                        Text(widget.source.address,
                            style: context.textTheme.bodyText1),
                        SmallFormDivider(),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: 500),
                        child: DebouncedValidatedFormField(
                          amountField,
                          onChanged: () {
                            setState(() {});
                          },
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 100,
                  )
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            color: AppColors.lightBackground,
            height: 100,
            padding: EdgeInsets.symmetric(horizontal: 64, vertical: 16),
            child: ElevatedButton(
              child: Text("Create"),
              onPressed: () async {
                await context.performLoading(() => context.icApi.createNeuron(
                    stakeInDoms: amountField.currentValue.toDouble().toDoms,
                    dissolveDelayInSecs: BigInt.zero,
                    fromSubAccount: widget.source.subAccountId));
                context.nav.push(NeuronTabsPage);
              }.takeIf((e) => <ValidatedField>[amountField].allAreValid),
            ),
          )
        ],
      ),
    );
  }
}
