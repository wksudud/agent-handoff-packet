# Evaluation

This page records the current v0.1 mini evaluation. It is a local, deterministic proxy test, not a real LLM task-completion benchmark.

## What Was Tested

- Five handoff cases comparing short natural-language prose with explicit AHP-style packets.
- Deterministic required-field recognition.
- Example validation pass rate.
- Approximate token size using a simple `chars / 4` estimate.
- Local parse, validate, render, and compact wire JSON parse speed.

## Current Results

Latest local run:

```text
Cases: 5
Prose required-field accuracy average: 0.70
Packet required-field accuracy average: 1.00
Example pass rate: 5/5
Average token delta, readable packet minus prose: +88.6
Average token delta, compact wire minus prose: +64.4
```

Benchmarks from the same run:

```text
prose field heuristic: 0.007412 ms/op
packet validation: 0.002575 ms/op
compact wire JSON parse: 0.020246 ms/op
example parse + validate + render: 0.813135 ms/op
```

## Interpretation

The current structure improves deterministic contract recognition. In this proxy test, prose exposed about 70% of required handoff fields, while packets exposed 100%.

It does not prove that AHP is shorter than prose. For short tasks, readable packets are longer because they make implicit requirements explicit. AHP v0.1 should therefore be described as a reliability and verification layer first, not as a token-compression format.

The expected path to lower communication cost is:

- summarize instead of forwarding full chat history;
- reference artifacts instead of pasting full files;
- use stable packet fields;
- optionally compile to compact wire format after the contract is proven.

## How To Reproduce

```powershell
npm run eval
npm test
node tools\validate.js examples\markdown-packet.md examples\yaml-packet.yaml examples\json-packet.json examples\multica-style.yaml examples\deerflow-style.yaml
```

Reports are written outside the publishable repository under the project runtime experiments directory:

```text
E:\Documents\Projects\20260517-Agent-Handoff-Packet\runtime\experiments\
```

## Caveats

- This is not a real agent benchmark.
- The token estimate is approximate.
- The prose field detector is a deterministic heuristic.
- A real benchmark should run paired agent tasks and record token use, missing-field rate, blocker rate, rework count, completion time, and verification pass rate.
