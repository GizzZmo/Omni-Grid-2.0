# Prompt Blueprints

Use these starting points inside **Prompt Lab**. Replace variables wrapped in `{{ }}` and snapshot versions as you iterate.

## 1. Incident Debrief (Engineering)
- **Tags:** coding, diagnostics
- **Prompt:**  
  `You are the incident commander. Summarize the root cause, timeline, customer impact, quick mitigations, and follow-up actions for ticket {{ticket_id}}. Keep it under 150 words and add a confidence score.`

## 2. Feature Brief (Product)
- **Tags:** product, analysis
- **Prompt:**  
  `Act as a staff PM. Write a one-pager for feature "{{feature_name}}" that includes: user problem, success metrics, assumptions, rollout risks, and 3 experiment ideas. Output as markdown bullets.`

## 3. Narrative Hook (Creative)
- **Tags:** creative, writing
- **Prompt:**  
  `Generate a 6-beat story arc for {{customer_name}} in a neon-cyberpunk tone. Beats: hook, disruption, mentor, trial, revelation, and closing CTA. Each beat <= 2 sentences.`

## 4. Data Guardrails (Safety)
- **Tags:** safety, compliance
- **Prompt:**  
  `You are a safety checker. Inspect the draft below for PII, secrets, or policy violations. List each finding with severity (low/med/high) and a suggested sanitized rewrite. Draft: "{{draft_text}}"`.
