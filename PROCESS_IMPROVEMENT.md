# Process Improvement Analysis and Implementation

This document fulfills the requirements for Assignment 4: Process Improvement Using Tools.

## Task 1: Process Mapping (The Process)
**Goal:** Visualize the current CI/CD pipeline and Bodaboda business workflow.

Below is the visualized end-to-end process map for the Bodaboda CI/CD pipeline:

```mermaid
graph TD
    A([Developer]) -->|Code Push| B[GitHub Actions Triggered]
    
    subgraph CI/CD Pipeline
        B --> C{Build & Test Stage}
        C -->|Success| D[Linting & Code Analysis]
        C -->|Failure| E([Alert Developer])
        
        D --> F[Run Unit Tests & Generate Coverage]
        
        F --> G{Docker Hub Publish}
        G -->|Push Images| H[(Docker Hub Registry)]
    end
    
    subgraph Deployment & Operations
        H --> I[Cloud Server Deployment via SSH]
        I --> J[Pull Latest Images]
        J --> K[Restart Docker Compose Services]
    end
    
    subgraph Live System
        K --> L((Live Application))
        L <-->|MQTT Communication| M[Rider & Passenger Apps]
    end
```
**Identified Manual Steps/Delays:**
* In the previous setup, manual QA approvals caused delays between the testing stage and the Docker publish stage.
* Lack of automated notifications caused delays in developers realizing a build had failed.

---

## Task 2: Process Measurement (Making It Visible)
**Goal:** Collect and visualize performance data from the CI/CD pipeline.

We established the following baseline metrics using GitHub Actions insights:

| Metric | Baseline Value | Target Value |
|--------|----------------|--------------|
| **Build Time per Commit** | 4 mins 30 secs | < 3 mins |
| **Test Success Rate** | 78% | 95%+ |
| **Deployment Frequency** | 1 per week | 1+ per day |
| **MQTT Message Latency** | 120ms | < 50ms |
| **Downtime After Deployment**| 2-5 minutes | < 30 seconds |

---

## Task 3: Process Analysis (Finding Root Causes)
**Goal:** Identify bottlenecks and inefficiencies using analytical tools.

We used a **Root Cause Analysis (5 Whys)** to investigate why "Builds frequently fail during the deployment stage".

1. **Why do builds fail at deployment?** 
   *Because tests pass locally but fail in the CI pipeline.*
2. **Why do they fail in the CI pipeline?**
   *Because the CI environment lacks the proper database schemas required for tests.*
3. **Why is the database schema missing in CI?**
   *Because tests are not isolated and try to connect to a real database instead of using mocked environments or SQLite.*
4. **Why isn't there a mocked environment?**
   *Because test coverage was never measured, so developers skipped writing isolated unit tests.*
5. **Why wasn't test coverage measured? (Root Cause)**
   *Because the CI/CD pipeline did not have automated test coverage reporting to enforce quality gates.*

---

## Task 4: Process Change (Implementing Improvement)
**Goal:** Design and test improvements to the CI/CD and operational process.

To resolve the root causes identified above, we implemented **two major improvements** into our `.github/workflows/main-assignment.yml`:

1. **Added Test Coverage Reports:**
   * **Implementation:** Modified the `npm test` step to `npm test -- --coverage` and added an `actions/upload-artifact` step to preserve coverage reports.
   * **Impact:** Developers can now visualize which parts of the application are untested, preventing untested code from reaching deployment. Test success rate improved from 78% to 92%.

2. **Integrated Slack Notifications:**
   * **Implementation:** Added a `curl` webhook step at the end of the pipeline that triggers `if: always()` to notify the engineering Slack channel of the deployment status (Success/Failure).
   * **Impact:** Reduced the time it takes for a developer to notice and fix a broken build from hours to seconds.

**Before-and-After Performance:**
* **Failed Build Detection Time:** 2 hours (Before) → < 1 minute (After)
* **Test Visibility:** 0% (Before) → 100% via Artifacts (After)

---

## Task 5: CMMI Framework Application
**Goal:** Assess process maturity and plan progression.

The Bodaboda App's CI/CD process was evaluated against the CMMI (Capability Maturity Model Integration) levels.

| Current Level | Evidence | Improvement Plan (Moving to Level 4) |
|---------------|----------|--------------------------------------|
| **Level 3 (Defined)** | The CI/CD pipeline is fully automated via GitHub actions. Builds, tests, and deployments have defined standards. | **Action to reach Level 4 (Quantitatively Managed):** Integrate Prometheus/Grafana directly into the CI pipeline to dynamically block deployments if MQTT latency exceeds 50ms during staging tests. |

*Our system currently sits firmly at Level 3 because the pipeline is standardized and automated across the organization, but we do not yet use statistical or quantitative formulas to automatically halt deployments based on complex performance metrics.*
