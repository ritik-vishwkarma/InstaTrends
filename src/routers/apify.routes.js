import { Router } from "express";
import { runActor } from "../controllers/apify.controller.js";
// import { storeCollectionName } from "../middleware/store.collectionName.js";
// import { answerQuery } from "../llm/index.js";
import { queryEndpoint } from "../llm/llm_query.js";

const router = Router();

router.route("/run-actor").post(runActor);
// router.route("/query").post(answerQuery)
router.route("/llmquery").post(queryEndpoint)

export default router;