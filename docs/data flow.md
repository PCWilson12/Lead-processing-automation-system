## Data Flow

The lead processing pipeline orchestrates how incoming lead data is validated, enriched, matched, and ultimately converted within Salesforce.

### 1. Lead Ingestion
- Lead data is received from Salesforce as the system of record.
- The workflow is triggered by lead creation or update events.

  ![Workflow Trigger](../images/workflow-trigger)
---

### 2. Contact Matching

The system attempts to associate the incoming lead with an existing contact:

#### Exact Email Match
- Check if a contact exists with the same email address.
- If found → use the existing contact.

  ![Exact Contact Matching](../images/check-for-matching-contact)

#### Fuzzy Name Matching
- If no email match is found, apply Jaro-Winkler similarity to compare the lead’s name against existing contacts.
- If a high-confidence match is found → use the matched contact.
![Fuzzy Name Matching](../images/fuzzy-contact-matching)
---

### 3. Account Matching

If no contact is identified, the system attempts to find a matching account:

#### Domain Matching
- Extract the email domain from the lead.
- Use Jaro-Winkler similarity to compare against existing account domains.
- If a match is found → select the corresponding account.

  ![Fuzzy Account Matching](../images/fuzzy-account-matching)

#### Account Creation via Enrichment
- If no account match is found:
  - Use Clay to enrich lead data.
  - Create:
    - A new account
    - A new contact associated with that account
      ![Create Net New](../images/net-new)

---

### 4. Contact Creation

If an account is identified but no contact exists:
- Create a new contact using lead data.
- Associate the contact with the matched account.
  ![Get Account Owner](../images/get-account-owner)

---

### 5. Ownership Validation

- Retrieve the owner of the matched account.
- Verify whether the current owner is the correct sales representative based on:
  - Territory
  - Workload
  - ICP (Ideal Customer Profile) alignment
 

---

### 6. Lead Assignment (if needed)

If reassignment is required:
- Apply a round-robin assignment strategy that considers:
  - Sales rep workload
  - Territory alignment
  - ICP qualification
 
    ![Assign Sales Rep](../images/round-robin)

---

### 7. Lead Conversion

- Convert the lead in Salesforce:
  - Updates the account
  - Updates or attaches the contact
  - Assigns appropriate campaigns

---

### 8. Notifications

- Notify relevant stakeholders via Slack.
- Alerts may include:
  - Assignment updates
  - New account creation
  - Conversion confirmation
 
    ![Convert Lead and Message Salesforce Users](../images/convert-lead-slack-alert)

---

### Summary

This pipeline ensures:
- High data integrity through layered matching strategies  
- Reduced duplication across contacts and accounts  
- Intelligent ownership assignment  
- Automated enrichment for incomplete data  
