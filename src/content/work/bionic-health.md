---
title: "A health platform, from the record up"
org: "Bionic Health (now Thrive Wellness)"
role: "Principal Data Scientist, leading Data Science & AI; ML engineer across the platform"
years: "2023–2024"
order: 2
summary: "Built a custom EHR and a web and mobile app for patients and clinicians: a system that ingested complex health data, ran inference on it, and let people explore it with an LLM assistant that produced custom analytics on the fly."
highlights:
  - "A custom EHR, built from the ground up"
  - "Web and mobile apps for patients and clinicians"
  - "Multi-modal risk models, including 30-year cardiovascular risk"
  - "An LLM assistant that runs custom analytics on demand"
---

## The problem

Preventive health generates a flood of data about one person: imaging, lab work and blood biomarkers, continuous glucose, blood pressure, sleep and heart rate. It usually lives in different systems, arrives in different formats, and means different things to the patient living with it and the clinician responsible for it. Too much of it goes unused.

We set out to build one system that could take all of it in, make sense of it, and put it in front of both people in a form they could act on.

## My role

I led Data Science & AI, and I worked as a hands-on ML engineer across the whole platform: the data model and pipelines, the models, and the product people actually used. Bionic Health was acquired in 2025 and is now Thrive Wellness.

<figure class="flow" aria-label="How the platform worked: ingest, understand, act, interact">
  <ol>
    <li><b>Ingest</b><span>Imaging, labs, glucose, blood pressure, sleep and heart rate, into a custom EHR</span></li>
    <li><b>Understand</b><span>Automated processing and inference: personalized disease-risk profiles</span></li>
    <li><b>Act</b><span>Web and mobile apps for patients and clinicians, built around each person's goals</span></li>
    <li><b>Interact</b><span>An LLM assistant that answers questions and builds custom analytics on the fly</span></li>
  </ol>
  <figcaption>One system, four jobs: the same data served two very different audiences.</figcaption>
</figure>

## What we built

- **A custom EHR.** We built the electronic health record ourselves rather than bolting onto one, so every kind of data, from MRI to a night of heart rate, had a first-class place in the same patient record.
- **Ingestion and inference.** An automated system that takes in multi-modal patient data and turns it into personalized disease-risk profiles, including a 30-year cardiovascular risk estimate. It combined statistical modeling, signal processing, computer vision and LLM-powered agents to make the processing scale.
- **Apps for patients and clinicians.** A web and mobile experience that gave patients the tools to work toward their health goals, and gave clinicians the view they needed to guide them.
- **An assistant for your own data.** An LLM-powered chat experience where patients and clinicians could ask questions of their data and get custom analytics on the fly, instead of waiting for someone to build a report.
- **Clinical decision support.** A FHIR-compliant, agent-based generative-AI framework that distills a patient's record into evidence-based recommendations for clinicians in real time.
- **Onboarding and guidance.** A retrieval-augmented assistant for onboarding, and lifestyle, nutrition and exercise guidance based on clinician-approved plans.

## What I learned

We had an unusual position: working in consumer health and clinical medicine at the same time. Patients and clinicians both wanted their data, but they wanted different things, at different moments, for different reasons. Getting the right data to the right person when they actually need it is the real problem, and it's harder than any single model.

Building an EHR from the ground up is hard, and it's rewarding: you learn exactly where clinical data comes from and every way it can go wrong. It's also where I learned to think in whole systems, from the record to the model to the person holding the phone, which is how I work today.
