# digital-twin-example
Eclipse Ditto digital twin example app


## Installation

Prerequisites:
- Docker installed (at least version 18.06 CE)
- Docker Compose installed (at least version 1.22)
- JDK 11 >= 11.0.5
- Apache Maven 3.x installed

1. Start docker daemon

```bash
sudo service docker start
```

2. Build ditto

In $DITTO_HOME execute:
```bash
mvn clean install
cd services
sh build-images.sh
```

3. Start ditto

In $DITTO_HOME execute:
```bash
cd deployment/docker/
docker-compose up -d
```

Check the logs after starting up:
```bash
docker-compose logs -f
```

4. Start appliaction

Open index.html in web browser
