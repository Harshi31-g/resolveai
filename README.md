# ResolveAI: Explainable AI-Powered Dispute Resolution Platform

> **Transforming card dispute resolution from a black box into a transparent, explainable, and trusted experience.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📌 Overview

Dispute resolution today lacks transparency.

Card Members don't understand why disputes are accepted or rejected.
Merchants believe the process is biased.
Investigators spend valuable time manually reviewing lengthy evidence trails.
Compliance teams struggle to reconstruct historical decisions during audits.

**ResolveAI** is an Explainable AI platform that introduces transparency into every dispute decision through a shared evidence scoring framework.

Instead of simply predicting an outcome, ResolveAI explains **why** a decision was made.

---

## 🚨 The Problem

Traditional dispute resolution systems suffer from:

- ❌ Black-box AI decisions
- ❌ Weeks-long investigation cycles
- ❌ Manual evidence review
- ❌ Lack of consistency between stakeholders
- ❌ Difficult compliance audits
- ❌ Poor customer trust

Every stakeholder sees a different version of the dispute.

---

# 💡 Our Solution

ResolveAI evaluates submitted evidence using three transparent dimensions:

- ✅ Completeness
- ✅ Consistency
- ✅ Corroboration

These combine into a single **Confidence Score** that determines the routing path.

```text
Confidence Score ≥ 85
        │
        ▼
 Auto Resolve

Confidence Score 60–84
        │
        ▼
 Human Investigator

Confidence Score < 60
        │
        ▼
 Request More Evidence
```

Unlike traditional fraud systems, every score is fully explainable.

---

# ✨ Key Features

## 👤 Card Member Portal

- File disputes
- Upload supporting evidence
- Track dispute progress
- View Decision Evidence Card
- Receive transparent explanations

---

## 🏪 Merchant Portal

- Respond to disputes
- Submit invoices and proof
- View evidence score
- Understand decision rationale
- Monitor dispute history

---

## 🕵️ Investigator Workspace

- Smart dispute queue
- AI-generated evidence summaries
- Side-by-side comparison
- Contradiction detection
- One-click decisions
- Automatic audit logging

---

## 📊 Decision Evidence Card

The core innovation of ResolveAI.

Every stakeholder sees the same decision using the same rubric.

### Evidence Score

| Category | Weight |
|----------|--------|
| Completeness | 35% |
| Consistency | 35% |
| Corroboration | 30% |

The explanation is adapted to the viewer while preserving identical reasoning.

---

## 🎯 Confidence Score Routing

| Score | Action |
|--------|---------|
| 85–100 | Auto Resolve |
| 60–84 | Human Review |
| 0–59 | Request Additional Evidence |

---

# 🧠 Why ResolveAI?

Most dispute platforms optimize for:

- Fraud Detection
- Accuracy
- Automation

ResolveAI optimizes for:

- Transparency
- Explainability
- Fairness
- Trust
- Auditability

Explanation is not an afterthought.

It is the product.

---

# 🎨 Score Composition Visual

ResolveAI uses a non-linear score visualization:

🟥 Red → Low Confidence

🟨 Wide Amber → Human Judgment Zone

🟩 Green → High Confidence

The amber region intentionally occupies the largest area because most real-world disputes require human interpretation.

---

# 🏗️ Architecture

```text
                Card Member
                     │
                     ▼
            Submit Evidence
                     │
                     ▼
           AI Evidence Scoring
      (Completeness • Consistency • Corroboration)
                     │
                     ▼
            Confidence Score Engine
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Auto Resolve   Human Review   More Evidence
      │              │              │
      └──────────────┼──────────────┘
                     ▼
          Decision Evidence Card
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
 Card Member      Merchant     Compliance
```

---

# ⚙️ Tech Stack

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## Backend

- Next.js API Routes
- Supabase
- PostgreSQL

## AI

- OpenAI / Gemini APIs
- Explainable Evidence Scoring
- Confidence Score Engine

## Deployment

- Vercel

---

# 📂 Project Structure

```
resolve-ai/
│
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── types/
├── public/
├── styles/
├── supabase/
├── utils/
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Harshi31-g/resolveai.git
```

---

## Install Dependencies

```bash
npm install
```

or

```bash
pnpm install
```

---

## Configure Environment Variables

Create a `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

OPENAI_API_KEY=

DATABASE_URL=
```

---

## Run Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

# 📸 Screenshots

## Landing Page


<img width="1891" height="742" alt="image" src="https://github.com/user-attachments/assets/eff46c8f-549a-49a7-9d71-a0e670ec935a" />
<img width="1827" height="631" alt="image" src="https://github.com/user-attachments/assets/38a3c1c1-fe8b-46d1-851f-f08addc21911" />
<img width="1752" height="677" alt="image" src="https://github.com/user-attachments/assets/b97cd118-c260-402c-82e2-553fe4987733" />

##  Dashboard

<img width="1909" height="727" alt="image" src="https://github.com/user-attachments/assets/d9c523d8-f622-476f-aeba-ea9f8b54fdd3" />

<img width="1446" height="589" alt="image" src="https://github.com/user-attachments/assets/261b8ba1-00b3-4556-9efb-6be7cb5cc3db" />
<img width="1482" height="720" alt="image" src="https://github.com/user-attachments/assets/94dbb162-6e1c-49cd-ae4e-1033559ef8d8" />



# 📈 Impact

ResolveAI enables:

- ⚡ Faster dispute resolution
- 🤝 Fair and explainable decisions
- 📉 Reduced investigator workload
- 📚 Complete audit trail
- 🔍 Higher stakeholder trust
- 🛡️ Compliance-ready workflows

---

# 🔮 Future Roadmap

- Voice dispute filing
- OCR document intelligence
- Multi-language support
- Real-time fraud insights
- Bank API integrations
- Predictive evidence recommendations
- LLM-powered investigator assistant
- Analytics dashboard
- Enterprise RBAC
- Webhook integrations

---

# 🏆 Built For

**American Express CodeStreet / Code First Challenge**

Theme:

> **Frictionless Dispute & Chargeback Resolution**

---

# 👥 Team

| Name | Role |
|------|------|
| Your Name | Full Stack Developer |
| Team Member | AI Engineer |
| Team Member | Backend Developer |

---

# 🔗 Links

## Live Demo

https://resolveai-roan.vercel.app/

## GitHub Repository

https://github.com/Harshi31-g/resolveai




## ⭐ If you found this project interesting, consider giving it a star!
