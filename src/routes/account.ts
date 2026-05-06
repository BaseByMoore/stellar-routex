import { Router, Request, Response } from 'express';
import { createAccount, getBalances } from '../services/stellar';
import { handleError } from '../utils/errorHandler';

const router = Router();

/** POST /create-account — generate a keypair and fund via Friendbot */
router.post('/create-account', async (_req: Request, res: Response) => {
  try {
    const account = await createAccount();
    res.json(account);
  } catch (err) {
    handleError(res, err);
  }
});

/** GET /balance/:publicKey — fetch all asset balances */
router.get('/balance/:publicKey', async (req: Request<{ publicKey: string }>, res: Response) => {
  try {
    const balances = await getBalances(req.params.publicKey);
    res.json({ balances });
  } catch (err) {
    handleError(res, err);
  }
});

export default router;
