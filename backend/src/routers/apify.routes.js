import { Router } from "express";
import { runActor } from "../controllers/apify.controller.js";
import { queryEndpoint } from "../llm/llm_query.js";
import { llmRunner } from "../openai/openai.js";

const router = Router();

router.route("/run-actor").post(runActor);
router.route("/llmquery").post(queryEndpoint);
router.route("/llm").post(llmRunner);

export default router;






// For Middleware, if needed in the future
// import { storeCollectionName } from "../middleware/store.collectionName.js";
// import { answerQuery } from "../llm/index.js";
// router.route("/query").post(answerQuery)