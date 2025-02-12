class queryAgents {
  agents = [];
  query = {};
  constructor(agents, query) {
    this.agents = agents;
    this.query = query;
  }

  departmentQuery = () => {
    this.agents = this.query.department
      ? this.agents.filter((d) => d.department === this.query.department)
      : this.agents;
    return this;
  };

  searchQuery = () => {
    this.agents = this.query.searchValue
      ? this.agents.filter(
          (a) =>
            a.name.toUpperCase().indexOf(this.query.searchValue.toUpperCase()) >
            -1
        )
      : this.agents;
    return this;
  };

  sortBudgetQuery = () => {
    if (this.query.sortBudget) {
      if (this.query.sortBudget === "low") {
        this.agents = this.agents.filter(
          (agent) => agent.pricePerMonth >= 50 && agent.pricePerMonth < 200
        );
      } else if (this.query.sortBudget === "medium") {
        this.agents = this.agents.filter(
          (agent) => agent.pricePerMonth >= 200 && agent.pricePerMonth < 500
        );
      } else if (this.query.sortBudget === "high") {
        this.agents = this.agents.filter(
          (agent) => agent.pricePerMonth >= 500 && agent.pricePerMonth < 1000
        );
      } else if (this.query.sortBudget === "vhigh") {
        this.agents = this.agents.filter(
          (agent) => agent.pricePerMonth >= 1000
        );
      }
    }
    return this;
  };
  
  skip = () => {
    let { pageNumber } = this.query;
    const skipPage = (parseInt(pageNumber) - 1) * this.query.parPage;
    let skipAgent = [];

    for (let i = skipPage; i < this.agents.length; i++) {
      skipAgent.push(this.agents[i]);
    }
    this.agents = skipAgent;
    return this;
  };

  limit = () => {
    let temp = [];
    if (this.agents.length > this.query.parPage) {
      for (let i = 0; i < this.query.parPage; i++) {
        temp.push(this.agents[i]);
      }
    } else {
      temp = this.agents;
    }
    this.agents = temp;
    return this;
  };

  getAgents = () => {
    return this.agents;
  };

  countAgents = () => {
    return this.agents.length;
  };
}

module.exports = queryAgents;
