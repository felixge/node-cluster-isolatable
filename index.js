module.exports = function isolatable() {
  function isolatable(master) {
    if (master.isWorker) {
      master.isolateWorker = function(timeout) {
        try {
          this.worker.timeout = timeout || this.worker.timeout;
          this.server.close();
          this.call('isolateWorker');
        } catch (e) {
          // server.close() throws an exception when called twice on the same
          // server, safe to ignore. Two requests got into one worker.
        }
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
