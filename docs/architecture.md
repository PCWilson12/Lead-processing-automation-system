# Architecture

## Core Systems

- **Salesforce**
  - Source of truth for leads, accounts, and users
  - Triggers workflow execution via lead events
  - Stores and updates all processed data

- **n8n (Workflow Orchestrator)**
  - Coordinates data flow between systems
  - Executes workflow logic and manages integrations
  - Handles API interactions and updates back to Salesforce

- **Clay (Data Enrichment Service)**
  - Enhances existing lead and account data
  - Provides additional company and contact intelligence

- **Slack (Communication Layer)**
  - Sends notifications to users
  - Integrates with workflow events for alerts

## Processing Layer

- **JavaScript (within n8n)**
  - Handles data validation and transformation
  - Implements matching and classification logic

## Data Flow

- Salesforce triggers workflows via lead events  
- n8n orchestrates processing and manages API interactions  
- JavaScript logic performs validation and transformation  
- Clay enriches lead and account data  
- Updated records are written back to Salesforce  
- Notifications are sent via Slack  
