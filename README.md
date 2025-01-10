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

## How to Run the Project

### Backend

1. Navigate to the `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Rename the `.env.example` file to `.env` and fill in the required environment variables.
4. Start the application:

```bash
npm run dev
```

### Frontend

1. Navigate to the `frontend` folder.
2. Install dependencies:

```bash
npm install
```

3. Go to the `frontend/src/app/(general)/utils/baseUrl.js` file and change the baseUrl to the address of the backend server.
4. Build the project:

```bash
npm run build
```

5. Start the application:

```bash
npm run start
```

---

## Deployment

The application is live and accessible at: **[https://sistem-za-upravljanje-energije-91846956206.europe-west3.run.app](https://sistem-za-upravljanje-energije-91846956206.europe-west3.run.app/login)**.

Please note: For the backend to function properly, you may need to enable the option to allow insecure content in your browser settings.
