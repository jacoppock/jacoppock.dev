---
title: "Heart rate on the move"
org: "Valencell"
role: "Machine Learning Engineer, Wearable Algorithms"
years: "2017–2018"
order: 4
summary: "Deep-learning algorithms for heart-rate and blood-pressure estimation from wearable optical sensors, built to hold up while people move."
highlights:
  - "Deep learning for heart rate and blood pressure from PPG"
  - "A cuffless blood-pressure monitor that went to market"
  - "Learning from dense signals with sparse labels"
flow:
  - title: "Sense"
    text: "An optical (PPG) sensor and an accelerometer, worn on the body"
  - title: "Clean"
    text: "Use the motion signal to subtract footsteps and arm swing from the light"
  - title: "Learn"
    text: "Deep models map the pulse waveform to heart rate and blood pressure"
  - title: "Anchor"
    text: "Sparse cuff readings anchor a continuous blood-pressure estimate"
flowCaption: "From light on the skin to a continuous vital sign."
figure: "ppg"
---

## The problem

Optical heart-rate sensors (PPG) work beautifully when you sit still. Run, and footsteps and skin motion swamp the pulse signal.

## My role

ML engineer on wearable algorithms.

## Approach

- Deep-learning models for heart-rate and blood-pressure prediction from PPG plus motion sensors.
- Real-world-data studies to validate clinical utility.

## Outcome

- A cuffless blood-pressure monitor that went to market.
- ETL pipelines for training, testing and validating time-series models.

## What made it hard

Blood pressure is usually a discrete measurement: a cuff gives you one reading every so often. We were trying to turn it into a continuous one. That creates a huge label imbalance: hours of dense optical signal, and only a handful of cuff readings to learn from. Finding real signal in that noise was hard, and harder still because people wore the sensors in different places on the body, and each site sees the pulse differently.

It taught me to respect the labels as much as the model. When ground truth is sparse, how you collect it and line it up with the signal decides how good the model can ever be.

The [Pulse exhibit](/lab/pulse) is a hands-on version of this problem.
