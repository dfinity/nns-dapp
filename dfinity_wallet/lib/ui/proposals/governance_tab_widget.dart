import 'package:dfinity_wallet/data/proposal.dart';
import 'package:dfinity_wallet/dfinity.dart';
import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/tab_title_and_content.dart';

class GovernanceTabWidget extends StatefulWidget {
    @override
    _GovernanceTabWidgetState createState() => _GovernanceTabWidgetState();
}

class _GovernanceTabWidgetState extends State<GovernanceTabWidget> {

    List<Proposal> proposals = [];


    @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if(context.boxes.proposals.isEmpty){
      [
        Proposal(
            "Precompiled contracts for addition and scalar multiplication on the elliptic curve alt_bn128." , "91175380908085661531", DateTime.now().add(random.nextDouble().days)
        ),
        Proposal(
            "Minimal Proxy Contract" , "55643373613721384592", DateTime.now().add(random.nextDouble().days)
        ),
        Proposal(
            "Uniformity Between 0xAb5801a7D398351b8bE11C439 e05C5B3259aeC9B and 0x15E55EF43efA8348dDaeAa45 5F16C43B64917e3c" , "89228947949245012542", DateTime.now().add(random.nextDouble().days)
        ),
      ].forEach((e){
        context.boxes.proposals.add(e);
      });
    }
  }

    @override
    Widget build(BuildContext context) {
        return ConstrainWidthAndCenter(child:
           TabTitleAndContent(title: "Governance", children: [Container(
              child: Card(
                color: AppColors.black,
                child: Padding(
                  padding: const EdgeInsets.all(15.0),
                  child: Text(
                      "The Internet Computer is Governed by Neurons. \n\nVoting power is determined by long term stakes in neurons.  \n\n Select a proposal below to vote on it.",
                      style: context.textTheme.bodyText1,
                      textAlign: TextAlign.center,
                  ),
                ),
              ),
          ),
             ...context.boxes.proposals.values.map((e) {
               return ProposalRow(proposal: e, onPressed: () {});
             })
           ],),
        );
    }
}



class ProposalRow extends StatelessWidget {
  final Proposal proposal;
  final VoidCallback onPressed;

  const ProposalRow({Key? key, required this.proposal, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: FlatButton(
        onPressed: onPressed,
        child: Container(
          width: double.infinity,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  proposal.name,
                  style: context.textTheme.headline3?.copyWith(color: AppColors.gray800),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 16.0, bottom: 16.0, right: 16.0),
                child: Text(
                  proposal.authorAddress,
                  style: context.textTheme.bodyText1?.copyWith(color: AppColors.gray800),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


