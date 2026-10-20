---
title: "The prototype was too small"
summary: "Starting simple is good advice. Starting small can be a trap, especially when your users are experts and the domain is dense. What building ContractIQ taught me about the difference."
date: "2026-10-20"
status: draft
---

When we started building ContractIQ, we did what you're supposed to do. We kept it simple.

ContractIQ turns payer contracts into reimbursement logic: given a contract and a claim, what should the hospital have been paid? Our first users were a small team of contract experts. They know these agreements better than anyone, and most of them are not technical. So the plan was sensible: ship something lightweight, earn their trust, grow from there.

We learned quickly that we had built the wrong kind of simple.

## The hard part wasn't the model

A payer contract is dense in a specific way. Rates depend on service lines, service lines have carve-outs, carve-outs have exceptions, and the whole thing changes on an anniversary date written into a paragraph on page forty. An expert reading it holds a structure in their head: this rule applies, unless that one does, adjusted by this other one.

Our first prototype hid that structure to keep the interface clean. It gave answers. And for expert users, answers without structure are worse than no answers at all. They couldn't see *why* a claim's expected payment was what it was. When it was wrong, they couldn't fix it; they had to ask us. A tool that makes an expert depend on an engineer isn't simple. It's small.

For non-technical experts, easy doesn't mean minimal. It means **legible** and **correctable**: they can read what the system believes, and they can change it.

## What "bigger" meant

Going bigger didn't mean more features. It meant a more complete model of the domain: representing each contract as structured, auditable logic that people can read, trust and change themselves.

Those two requirements pull against each other. Interpretable wants the representation close to the contract's own language. Modifiable wants it close to something a machine can execute and check. Most of the real design work lives in that tension, and you can't find it with a prototype that sidesteps it.

The shift also changed what the output *is*. A system like this shouldn't hand back a number. It should hand back an argument: here is the clause, here is how it applies to this claim, here is the arithmetic. The expert's job becomes checking the argument, which is exactly the job they're best at.

## How to tell your prototype is too small

I don't think this is unique to contracts. Any time you're building for experts in a dense domain, like clinicians, actuaries, engineers or lawyers, watch for a few signs:

- **People keep their own spreadsheet next to your tool.** They're rebuilding the structure you hid.
- **Every correction goes through your team.** Your users can see that something is wrong but can't say how to make it right.
- **People ask "why?" more than "what?"** The answer isn't the product. The reasoning is.

If you see these early, they aren't adoption problems you can fix with onboarding. Your representation is too thin for the domain.

## The leadership part

The decision to rebuild bigger was a team decision, and I've come to think the conditions behind it are most of what leading an applied team means.

The first is permission to dream big. Someone has to be allowed to say "this is too small" about a prototype everyone worked hard on. The second is the discipline to check assumptions. "Adoption first" was an assumption, and because we wrote it down and tested it with real users, it failed fast enough to be cheap. The third is collaboration. The people who told us the prototype was too small were the contract experts, not the engineers. They were never just end users. They were co-designers, and the system got better the moment we treated them that way.

Start simple. Just don't confuse simple with small. When the domain is dense, the representation *is* the product.
