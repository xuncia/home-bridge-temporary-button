const { exec } = require("child_process");

let Service, Characteristic;

module.exports = (api) => {
    Service = api.hap.Service;
    Characteristic = api.hap.Characteristic;
    api.registerAccessory("TemporaryButton", TemporaryButton);
};

class TemporaryButton {
    constructor(log, config, api) {
        this.log = log;
        this.name = config.name;
        this.onCommand = config.onCommand;
        this.duration = config.duration || 1000; // Tempo in millisecondi per il ritorno allo stato di "spento"
        this.service = new Service.Switch(this.name);

        this.service
            .getCharacteristic(Characteristic.On)
            .on("set", this.handleOnSet.bind(this));
    }

    handleOnSet(value, callback) {
        if (value) {
            this.log(`Eseguo comando: ${this.onCommand}`);
            exec(this.onCommand, (error, stdout, stderr) => {
                if (error) {
                    this.log(`Errore nell'esecuzione del comando: ${error.message}`);
                } else {
                    this.log(`Output comando: ${stdout}`);
                }
            });

            // Torna allo stato spento dopo la durata specificata
            setTimeout(() => {
                this.service.updateCharacteristic(Characteristic.On, false);
            }, this.duration);
        }
        callback(null);
    }

    getServices() {
        return [this.service];
    }
}
