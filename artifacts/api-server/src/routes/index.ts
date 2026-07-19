import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(ordersRouter);

export default router;
