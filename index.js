module.exports = function isolatable() {
  function isolatable(master) {
    if (master.isWorker) {
      master.isolateWorker = function(timeout) {
        if (!this.server.fd) {
          // Server already closed, this will happen if two requests make it
          // into the same isolated worker.
          return;
        }

        this.worker.timeout = timeout || this.worker.timeout;
        this.server.close();
        this.call('isolateWorker');
      };

      return;
    }

    master.isolateWorker = function(worker) {
      if (!worker) {
        return;
      }

      worker.proc.kill('SIGQUIT');
      master.removeWorker(worker.id);
      master.emit('worker removed', worker);
      master.spawnWorker(worker.id);
    };
  };

  isolatable.enableInWorker = true;

  return isolatable;
};
