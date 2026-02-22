# inceptIQ Product Documentation

## Product Overview
inceptIQ is a web platform that helps founders validate startup ideas quickly using AI analysis, structured reports, and founder-investor community discovery. It combines structured idea intake with AI‑generated insights, exportable deliverables, and a community layer for feedback and connections.

## Problem Statement
Early‑stage founders often make high‑impact decisions with limited data, limited time, and limited access to expert feedback. Traditional market research and consultant validation are slow, expensive, and hard to repeat as an idea evolves.

## Market Gap
The market is fragmented:
- Tools that do AI analysis often stop at raw text outputs and lack actionable workflows.
- Investor directories exist, but are disconnected from the founder’s actual idea and validation stage.
- Community feedback platforms focus on visibility, not structured validation.

inceptIQ fills this gap by providing a single workflow: structured input, AI analysis, exportable reports, and community discovery in one place.

## Why People Need This Website
Founders and early teams need:
- Fast, structured validation before spending months building.
- Clear feedback on uniqueness, market, and competition.
- Shareable artifacts for teams, advisors, and investors.
- A way to discover similar founders or potential investors.

inceptIQ turns a raw idea into an actionable, shareable plan and enables lightweight connections through the community.

## Target Users
- Founders and early startup teams who need rapid idea validation.
- Investors who want a pipeline of structured founder submissions.
- Startup studios, accelerators, and student builders who need repeatable analysis.

## Core Functionality

### 1. AI Startup Analysis
- Founders submit an idea title and description, plus optional fields like industry, target market, business model, budget, and timeline.
- The system generates AI analysis including uniqueness, market viability, competition, risks, opportunities, recommendations, and key metrics.

### 2. Results Dashboard
- Scores and summaries are displayed in a structured results view.
- Results are broken into tabs for focus: Overview, Uniqueness, Market, Competition, Metrics, Risks, Opportunities, Recommendations.

### 3. PDF Report Export
- A professional PDF report can be generated and downloaded from the results page.

### 4. Pitch Deck Generator
- Users can generate a PowerPoint pitch deck from the analysis and choose a template style.

### 5. Collaboration & Sharing
- Founders can invite collaborators by email to view an analysis.
- Collaborators must have accounts before they can access shared analyses.

### 6. Community Publishing
- Founders can publish their idea to the community.
- Only the idea form fields are published, not the AI report.
- Community members can upvote, downvote, or like posts.
- Founders can delete their own posts.

### 7. Founder Matching (Similar Ideas)
- From the results page, founders see a “Founder Matches” section.
- Matches are computed from community posts using similarity scoring.
- If a founder chooses to connect, the system opens a mail client with a prefilled email (no internal messaging).

### 8. Investor Directory & Matching
- Investors can browse a directory of investors and filter by stage, industry, geography, and check size.
- Founders can run investor matching based on their startup criteria.

### 9. Profile & Research History
- Each user has a profile page with their analysis history.
- Research history includes idea titles, descriptions, and timestamps.

### 10. Document Auto‑Fill (Optional)
- Founders can upload a PDF or provide text to auto‑fill idea fields using AI extraction.

### 11. Help & Support Pages
- Documentation, FAQ, Support, Privacy, Terms, and Cookie Policy pages are available in the UI.

## User Journeys

### Founder Journey
1. Sign up or log in as a founder.
2. Enter idea details and run AI analysis.
3. Review scores and recommendations.
4. Download the PDF report or pitch deck.
5. Publish to community for feedback.
6. Review similar founder matches and connect by email.

### Investor Journey
1. Log in as an investor.
2. Browse community “Projects” view (founder submissions).
3. Contact founders via email if interested.
4. Use investor directory to discover other investors or co‑investors.

## Data & Privacy
- Analysis inputs and results are stored per user account.
- Community posts only expose the idea form fields, not the AI report.
- Founder matches only use community posts and do not expose private analyses.

## Limitations and Disclaimers
- AI outputs are advisory and not guarantees of success.
- Matching is similarity‑based and may miss nuanced overlaps.
- Email connection relies on external email clients, not in‑app messaging.

## Technology Summary
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- AI: Google Gemini
- Reporting: PDF generation and PPTX pitch deck export

## Summary
inceptIQ delivers a fast, structured validation pipeline for early‑stage ideas, plus community visibility and lightweight founder‑to‑founder or founder‑to‑investor connections. It bridges analysis, action, and networking in one workflow.
