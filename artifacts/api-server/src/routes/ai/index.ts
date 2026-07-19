import { Router, type IRouter } from "express";
import chatRouter from "./chat";
import websitePreviewRouter from "./websitePreview";
import imageRouter from "./image";
import copywritingRouter from "./copywriting";
import seoAuditRouter from "./seoAudit";

const router: IRouter = Router();

router.use(chatRouter);
router.use(websitePreviewRouter);
router.use(imageRouter);
router.use(copywritingRouter);
router.use(seoAuditRouter);

export default router;
