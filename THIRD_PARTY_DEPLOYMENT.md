# Third-Party Deployment Integration

## 1. Platform Used
- **Container Registry:** Docker Hub
- **Cloud Provider (Target):** DigitalOcean / AWS EC2 (Simulated via SSH)
- **CI/CD Service:** GitHub Actions
- **MQTT Broker:** Eclipse Mosquitto (running on Cloud Server)

## 2. Pipeline Explanation

Our CI/CD pipeline (`.github/workflows/main-assignment.yml`) successfully automates the build, test, and deployment of the Bodaboda application using real-time third-party integration. The workflow follows these stages:

1. **Code Push (Trigger):** The pipeline runs automatically when code is pushed to the `main` or `develop` branches, or when a new version tag (e.g., `v1.0.0`) is created.
2. **Build & Test (Failure Handling - Task 6):** The `test` job installs dependencies, lints the code, and builds the frontend. If any of these steps fail, the pipeline immediately halts, preventing a broken build from being deployed.
3. **MQTT Integration Test (Task 4):** A dedicated `mqtt-test` job verifies that our backend can successfully connect to an MQTT broker, subscribe to topics (`bodaboda/ride/status`), and publish messages.
4. **Publish to Third-Party (Task 2 & 5):** Once tests pass, the `publish` job authenticates with Docker Hub using our generated credentials (stored in GitHub Secrets). It builds the Docker image and tags it using Semantic Versioning (`latest`, `v1.0`, or the commit SHA). It then pushes the image to Docker Hub.
5. **Automated Deployment (Task 3):** The `deploy` job connects to our production server via SSH. It pulls the freshly built image directly from Docker Hub (the external third-party registry) rather than building it locally on the server. Finally, it restarts the Docker Compose stack to serve the new application version.

## 3. Screenshots
*(Students: Insert your screenshots below before submission)*

- **Successful Push to Docker Hub:**
  `[Insert screenshot showing the image in your Docker Hub repository]`
  
- **Automated Deployment & Pipeline Run:**
  `[Insert screenshot of the green checkmarks in your GitHub Actions Pipeline tab]`

- **Real-Time MQTT Communication:**
  `[Insert screenshot of the MqttDemoPage or logs showing messages being received]`

## 4. Challenges Faced
- **Networking/Database Failures:** Initially, the backend struggled to resolve the database container within the Docker network. This was fixed by ensuring all services referenced the correct container names in the `docker-compose.yml` overrides.
- **Port Conflicts:** The frontend ran into port `5173` binding issues when a local dev server was already running. This was resolved by managing background processes correctly.
- **Secrets Management:** Securely passing SSH keys and Docker Hub tokens into GitHub Actions without exposing them in the logs required careful setup of GitHub Repository Secrets.
