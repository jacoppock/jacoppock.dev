---
title: "Imaging the spine under load"
org: "Duke University"
role: "ML Research Scientist, Medical Imaging (PhD, Biomedical Engineering)"
years: "2020–2023"
order: 3
summary: "Deep-learning segmentation and registration of MRI to measure how intervertebral discs deform and recover, which became my dissertation."
highlights:
  - "Deep-learning MRI segmentation and diffeomorphic registration"
  - "Measured how living spinal discs deform under load"
  - "Dissertation, first-author papers, and a US patent"
flow:
  - title: "Load"
    text: "Participants scanned with MRI before and after a treadmill walking stress test"
  - title: "Segment"
    text: "Deep-learning models outline each intervertebral disc in 3D"
  - title: "Register"
    text: "Diffeomorphic registration matches the same tissue across time points"
  - title: "Measure"
    text: "Disc height, shape and voxel-wise strain, compared before and after loading"
flowCaption: "The imaging pipeline behind my dissertation."
---

## The problem

Low back pain is common and costly, yet we have few ways to measure how a living spinal disc actually responds to everyday loading. Tracking subtle changes in disc shape and composition from MRI by hand is slow and inconsistent.

<figure data-fig="duke-t2"></figure>

## My role

PhD researcher in the Musculoskeletal Bioengineering Lab (advisor: Louis DeFrate). I built the ML and signal-processing pipeline and ran the studies. I also helped manage NIH-funded grants.

## Approach

- Deep-learning models that automatically segment intervertebral discs in MR images.
- An unsupervised, diffeomorphic image-registration method that estimates voxel-wise disc strain in vivo, without anything invasive.
- Controlled loading studies (e.g., treadmill walking) imaged before and after exercise.

<figure data-fig="duke-seg"></figure>

<figure data-fig="duke-method"></figure>

<figure data-fig="duke-warp"></figure>

## Outcome

- Dissertation: *Development of Imaging-Based Models for Analyzing the Spatiotemporal Function of Intervertebral Discs* (Duke, 2023).
- Finding: higher BMI means greater lumbar disc deformation after a walking stress test (*Journal of Biomechanics*, 2021).
- See [Research](/research) for papers and the patent.
- Scrub one disc from before to after a walk in [The Disc](/lab/disc), built from the study data.

## What I'd tell a new PhD student

Explore your interests. Try something hard, fail at it, learn from it, and build something better. And pay attention to the bleeding edge of the science, because the method you need may have been published last month.
