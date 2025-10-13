import express from "express";
import { Case, Contract } from "../models.js";
const router = express.Router();

router.get("/", async (req, res) => {
  // Fetch all cases and contracts
  const cases = await Case.find();
  const contracts = await Contract.find();

  // Dashboard counts
  const ongoingCases = cases.filter(c => c.status === "open").length;
  const closedCases = cases.filter(c => c.status === "closed").length;
  const pendingContracts = contracts.filter(c => c.status === "pending").length;

  // Risk analysis: count case types
  const typeCounts = {};
  cases.forEach(c => {
    typeCounts[c.caseType] = (typeCounts[c.caseType] || 0) + 1;
  });

  // Financial exposure: sum contract values (assumes a 'value' field)
  const totalContractValue = contracts.reduce((sum, c) => sum + (Number(c.value) || 0), 0);

  res.json({
    dashboard: {
      ongoingCases,
      closedCases,
      pendingContracts,
      totalContractValue,
    },
    riskAnalysis: typeCounts,
  });
});



export default router;
