import {mock} from 'jest-mock-extended';
import {AccountIdentifier, ICP, LedgerCanister} from '@dfinity/nns';
import {sendICP} from '../../../lib/api/ledger.api';
import {mockIdentity} from '../../mocks/auth.store.mock';


describe("ledger-api", () => {

    let spyTransfer;

    const accountIdentifier = '1bd1335532621e94c41f94757221d967c01738bfbe93418e0492f08fb44c21f0';
    const amount = ICP.fromE8s(BigInt(11_000));

    beforeAll(() => {
        const ledgerMock = mock<LedgerCanister>();
        ledgerMock.transfer.mockResolvedValue(BigInt(0));

        jest
            .spyOn(LedgerCanister, "create")
            .mockImplementation((): LedgerCanister => ledgerMock);

        spyTransfer = jest.spyOn(ledgerMock, "transfer");
    });

    afterAll(() => jest.clearAllMocks())

    it("should call ledger to send ICP", async () => {
        await sendICP({
            identity: mockIdentity,
            to: accountIdentifier,
            amount
        })

        expect(spyTransfer).toHaveBeenCalledWith({
            to: AccountIdentifier.fromHex(accountIdentifier),
            amount
        })
    });

    it("should call ledger to send ICP with subaccount Id", async () => {
        await sendICP({
            identity: mockIdentity,
            to: accountIdentifier,
            amount,
            fromSubAccountId: 1
        })

        expect(spyTransfer).toHaveBeenCalledWith({
            to: AccountIdentifier.fromHex(accountIdentifier),
            amount,
            fromSubAccountId: 1
        })
    });
});
