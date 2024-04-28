const { scheduleJob } = require("node-schedule");

class CronJob {
  async startJobs(job) {
    scheduleJob(job.schedule, job.task)
  }
}

module.exports = CronJob;