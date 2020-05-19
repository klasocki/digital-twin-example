class App {
    constructor() {
        this.config = {
            "thingId": "org.eclipse.ditto:smartjacuzzi",
            "thingJson": {
                "attributes": {
                    "manufacturer": "Ditto demo device corp.",
                    "model": "Smart house jacuzzi",
                    "capacity": 719
                },
                "features": {
                    "water-tub": {
                        "properties": {
                            "configuration": {
                                "smartMode": true,
                                "targetTemp": 40,
                                "tempToHold": 21,
                                "timeoutSeconds": 6000
                            },
                            "status": {
                                "waterAmount": 550,
                                "temperature": 21
                            }
                        }
                    },
                    "bubble-maker": {
                        "properties": {
                            "turned-on-counter": 0
                        }
                    }
                }
            },
            "waterTub": {
                "feature": "water-tub",
                "onSubject": "startJacuzzi",
                "onPayload": {
                    "temperature": 40
                },
                "offSubject": "stopJacuzzi",
                "offPayload": {
                    "temperature": 21
                },
                "successResponse": true,
                "failureResponse": false
            },
            "bubbleMachine": {
                "makeBubblesSubject": "makeBubbles",
                "makeBubblesPayload": {
                    "strength": 0.7,
                    "captcha": ""
                }
            }
        };

        this.frontend = new FrontendApp(this.config, () => this.getConnectionConfig());
        this.smartJacuzziApp = new SmartJacuzziApp(this.config, () => this.getConnectionConfig());
    }

    getConnectionConfig() {
        return new ConnectionConfig($('#dittoHost').val(),
            $('#dittoUser').val(),
            $('#dittoPassword').val());
    }
}

class ConnectionConfig {
    constructor(host, username, password) {
        this.host = host;
        this.username = username;
        this.password = password;
    }

    getHost() {
        return this.host;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }
}

// Startup
$(document).ready(new App());
