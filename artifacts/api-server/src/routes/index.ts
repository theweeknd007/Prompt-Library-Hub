import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import promptsRouter from "./prompts";
import aiRouter from "./ai";
import statsRouter from "./stats";
import plansRouter from "./plans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(promptsRouter);
router.use(aiRouter);
router.use(statsRouter);
router.use(plansRouter);

export default router;
