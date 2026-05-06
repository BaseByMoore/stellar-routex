import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';
import axios from 'axios';

const horizonUrl = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const networkPassphrase =
  process.env.STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

export const server = new Horizon.Server(horizonUrl);

/** Fund a new account via Friendbot (testnet only) */
export async function createAccount(): Promise<{ publicKey: string; secretKey: string }> {
  const keypair = Keypair.random();
  await axios.get(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
  return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
}

/** Return all balances for an account */
export async function getBalances(publicKey: string) {
  const account = await server.loadAccount(publicKey);
  return account.balances;
}

/** Send a simple payment between two accounts */
export async function sendPayment(
  secretKey: string,
  destination: string,
  amount: string,
  assetCode = 'XLM',
  assetIssuer?: string
) {
  const keypair = Keypair.fromSecret(secretKey);
  const sourceAccount = await server.loadAccount(keypair.publicKey());

  const asset = assetCode === 'XLM' ? Asset.native() : new Asset(assetCode, assetIssuer!);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(Operation.payment({ destination, asset, amount }))
    .addMemo(Memo.none())
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

/**
 * Path payment: send sourceAsset, receiver gets destAsset.
 * Stellar automatically finds the best conversion path.
 */
export async function routePayment(
  secretKey: string,
  destination: string,
  sendAssetCode: string,
  sendAssetIssuer: string | undefined,
  destAssetCode: string,
  destAssetIssuer: string | undefined,
  destAmount: string,
  sendMax: string
) {
  const keypair = Keypair.fromSecret(secretKey);
  const sourceAccount = await server.loadAccount(keypair.publicKey());

  const sendAsset =
    sendAssetCode === 'XLM' ? Asset.native() : new Asset(sendAssetCode, sendAssetIssuer!);
  const destAsset =
    destAssetCode === 'XLM' ? Asset.native() : new Asset(destAssetCode, destAssetIssuer!);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax,
        destination,
        destAsset,
        destAmount,
        path: [], // Horizon auto-discovers the path
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

/** Find available conversion paths between two assets */
export async function findPaymentPaths(
  sourceAccount: string,
  destAssetCode: string,
  destAssetIssuer: string | undefined,
  destAmount: string
) {
  const destAsset =
    destAssetCode === 'XLM'
      ? Asset.native()
      : new Asset(destAssetCode, destAssetIssuer!);

  const paths = await server
    .strictReceivePaths(sourceAccount, destAsset, destAmount)
    .call();

  return paths.records;
}
