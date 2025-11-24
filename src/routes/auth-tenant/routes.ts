import { Router, type Request, type Response } from 'express';
import { otpLoginSchema, otpVerifySchema } from './validation';
import { requestOtp, verifyOtp } from './service';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
    try {
        const parse = otpLoginSchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const result = await requestOtp(parse.data.email);
        res.json({ success: true, data: result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        res.status(400).json({ error: 'AuthenticationError', message });
    }
});

router.post('/verify', async (req: Request, res: Response) => {
    try {
        const parse = otpVerifySchema.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const result = await verifyOtp(parse.data.email, parse.data.otp);
        res.json({ success: true, data: result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed';
        res.status(401).json({ error: 'AuthenticationError', message });
    }
});

export default router;
