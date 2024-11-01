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
        this.duration = config.duration || 1000; // Tempo in millisecondi per il ritorno allo stato chiuso

        // Cambia da Switch a Door per usare i comandi "apri" e "chiudi"
        this.service = new Service.Door(this.name);

        // Configura le caratteristiche di apertura/chiusura
        this.service
            .getCharacteristic(Characteristic.TargetDoorState)
            .on("set", this.handleDoorSet.bind(this));

        // Stato corrente della porta (aperto/chiuso)
        this.service
            .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
    }

    handleDoorSet(value, callback) {
        // Verifica se la porta viene aperta
        if (value === Characteristic.TargetDoorState.OPEN) {
            this.log(`Eseguo comando: ${this.onCommand}`);

            // Esegue il comando per aprire il cancelletto
            exec(this.onCommand, (error, stdout, stderr) => {
                if (error) {
                    this.log(`Errore nell'esecuzione del comando: ${error.message}`);
                } else {
                    this.log(`Output comando: ${stdout}`);
                }
            });

            // Imposta lo stato come aperto e poi lo chiude dopo la durata specificata
            this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);

            setTimeout(() => {
                this.service.updateCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
                this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
            }, this.duration);
        }

        callback(null);
    }

    getServices() {
        return [this.service];
    }
}
