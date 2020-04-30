class CronManager {
  constructor() {
    this.jobs = [];
  }

  addJob(job) {
    this.jobs.push(job);
  }

  startJobs() {
    this.map.jobs((job) => {
      job.start();
    });
  }

  stopJobs() {
    this.jobs.map((job) => {
      job.stop();
    });

    this.jobs = [];
  }

  getJobs() {
    return this.jobs;
  }
}

export default new CronManager();
