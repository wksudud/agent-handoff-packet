# Roadmap: Future AI-Native Format

v0.1 deliberately avoids making a new syntax mandatory.

The long-term idea is still valuable: agent-to-agent communication may benefit from a compact AI-native format that is easier to parse, patch, route, and verify than ordinary prose.

## Why Wait?

- Existing formats already work well enough for adoption.
- A new syntax needs real examples before it can be designed responsibly.
- Debugging, diffing, and manual review still matter.
- Over-compression can reduce model reliability even when it saves tokens.

## Candidate Direction

A later `.ahp` format may become a compact bracket or block syntax that compiles into the same canonical packet object:

```text
(packet type:handoff v:0.2
  (goal "Implement validator examples")
  (constraint must "Do not modify protected runtime data")
  (accept "Examples validate successfully")
  (return status changed_paths verification blockers handoff_summary))
```

## Promotion Criteria

Do not promote a new syntax until:

- at least 20 real packet examples exist;
- common fields have stabilized;
- validator failures show repeated ambiguity in existing formats;
- the syntax can render cleanly to Markdown and JSON;
- token savings are measured against pretty JSON, minified JSON, and YAML-like packets.
