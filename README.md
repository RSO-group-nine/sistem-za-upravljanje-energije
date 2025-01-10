# Energy Management System for Smart Homes

**Cloud Computing Services**  
**Žiga Črv, Rok Rajher**  
**Academic Year 2024/25**  
**Faculty of Computer and Information Science, University of Ljubljana**

---

## Application Idea

A web application that monitors household energy consumption and provides recommendations for energy savings.

## Planned Features

- **Authentication Service:**  
  We will ensure user authentication using JWT for session management.

- **IoT Device Connection:**  
  Devices will be connected via Azure IoT Hub, from which we will retrieve their data.

- **Monitoring and Management System:**  
  We will develop a service that allows users to monitor and control smart devices through a REST API.

- **Energy-Saving Recommendations:**  
  A microservice will be implemented using the OpenAI API to provide insights into energy consumption based on collected data.

---

## Project Structure

The application is divided into two main folders:

1. **Frontend** (React.js)
2. **Backend** (Moleculer.js)

---

### Backend

Navigate to the backend folder and use the following scripts:

#### Commands

```json
"scripts": {
  "dev": "moleculer-runner --repl --hot services/**/*.service.js",
  "start": "moleculer-runner",
  "cli": "moleculer connect NATS",
  "ci": "jest --watch",
  "test": "jest --coverage",
  "lint": "eslint services",
  "dc:up": "docker-compose up --build -d",
  "dc:logs": "docker-compose logs -f",
  "dc:down": "docker-compose down"
}
```

#### Development mode

```bash
npm run dev
```

#### Start production mode

```bash
npm run build
npm run start
```

#### Run tests

```bash
npm run test
```

#### Run lint

```bash
npm run lint
```

#### Docker compose commands

Docker logs:

```bash
npm run dc:logs
```

Docker compose up and down

```bash
npm run dc:up
npm run dc:down
```

---

### Frontend

Navigate to the frontend folder and use the following scripts:

#### Commands

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

#### Development mode

```bash
npm run dev
```

#### Start production mode

```bash
npm run build
npm run start
```

#### Run lint

```bash
npm run lint
```

---

## Deployment

The application is live and accessible at: **[https://sistem-za-upravljanje-energije-91846956206.europe-west3.run.app](https://sistem-za-upravljanje-energije-91846956206.europe-west3.run.app/login)**.

Please note: For the backend to function properly, you may need to enable the option to allow insecure content in your browser settings.
