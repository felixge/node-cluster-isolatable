module.exports = function isolatable() {
  function isolatable(master) {
    if (master.isWorker) {
      master.isolateWorker = function() {
        try {
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

      master.spawn(1);
      worker.proc.kill('SIGQUIT');
      master.removeWorker(worker.id);
      master.emit('worker removed', worker);
    };
  };

  isolatable.enableInWorker = true;

  return isolatable;
};
