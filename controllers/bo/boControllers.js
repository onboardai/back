import Agent from "../../models/Agent.js";
import queryAgents from "../../utils/queryAgents.js";
import { responseReturn } from "../../utils/response.js";

export const query_Agents = async (req, res) => {
  const parPage = 12;
  req.query.parPage = parPage;

  try {
    const agents = await Agent.find({}).sort({
      createdAt: -1,
    });

    const totalAgent = new queryAgents(agents, req.query)
      .departmentQuery()
      .searchQuery()
      .sortBudgetQuery()
      .countAgents();

    const result = new queryAgents(agents, req.query)
      .departmentQuery()
      .searchQuery()
      .sortBudgetQuery()
      .limit()
      .skip()
      .getAgents();

    responseReturn(res, 200, {
      agents: result,
      totalAgent,
      parPage,
    });
  } catch (error) {
    console.log(error.message);
  }
};
