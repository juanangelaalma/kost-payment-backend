const CronJob = require("./CronJob");
const CreateBillJob = require("./bill/CreateBillJob");

class JobRunner {
  constructor() {
    this.run()
    console.log('Job is running')
  }

  run() {
    const cronJob = new CronJob();

    const createBillJob = new CreateBillJob();
    cronJob.startJobs(createBillJob);
  }
}

module.exports = JobRunner;