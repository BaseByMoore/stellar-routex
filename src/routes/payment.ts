import { Router, Request, Response } from 'express';
import { sendPayment, routePayment, findPaymentPaths } from '../services/stellar';
import { handleError } from '../utils/errorHandler';

const router = Router();

/**
 * POST /send-payment
 * Body: { secretKey, destination, amount, assetCode?, assetIssuer? }
 */
router.post('/send-payment', async (req: Request, res: Response) => {
  const { secretKey, destination, amount, assetCode, assetIssuer } = req.body;
  if (!secretKey || !destination || !amount) {
    res.status(400).json({ error: 'secretKey, destination, and amount are required' });
    return;
  }
  try {
    const hash = await sendPayment(secretKey, destination, amount, assetCode, assetIssuer);
    res.json({ success: true, hash });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * POST /route-payment — path payment with automatic asset conversion
 * Body: {
 *   secretKey, destination,
 *   sendAssetCode, sendAssetIssuer?,
 *   destAssetCode, destAssetIssuer?,
 *   destAmount, sendMax
 * }
 */
router.post('/route-payment', async (req: Request, res: Response) => {
  const {
    secretKey,
    destination,
    sendAssetCode,
    sendAssetIssuer,
    destAssetCode,
    destAssetIssuer,
    destAmount,
    sendMax,
  } = req.body;

  if (!secretKey || !destination || !sendAssetCode || !destAssetCode || !destAmount || !sendMax) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const hash = await routePayment(
      secretKey,
      destination,
      sendAssetCode,
      sendAssetIssuer,
      destAssetCode,
      destAssetIssuer,
      destAmount,
      sendMax
    );
    res.json({ success: true, hash });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * GET /paths?source=<publicKey>&destAsset=<code>&destIssuer=<issuer>&destAmount=<amount>
 * Returns available conversion paths for a route payment
 */
router.get('/paths', async (req: Request, res: Response) => {
  const { source, destAsset, destIssuer, destAmount } = req.query as Record<string, string>;
  if (!source || !destAsset || !destAmount) {
    res.status(400).json({ error: 'source, destAsset, and destAmount are required' });
    return;
  }
  try {
    const paths = await findPaymentPaths(source, destAsset, destIssuer, destAmount);
    res.json({ paths });
  } catch (err) {
    handleError(res, err);
  }
});

export default router;
