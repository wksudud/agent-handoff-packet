# Markdown Packet Example

The human-facing page can contain context, but the packet block is the contract.

```ahp-yaml
packet_type: handoff
goal: Implement validator examples for AHP v0.1.
target_agent: executor
constraints:
  - Keep the implementation zero-dependency.
  - Do not claim Markdown, JSON, or YAML are obsolete.
inputs:
  - schemas/packet.schema.json
  - examples/
expected_outputs:
  - Working validator.
  - Rendered human brief.
acceptance:
  - Every example validates successfully.
  - The renderer prints goal, constraints, acceptance, and return requirements.
failure_boundary:
  - Stop before publishing to GitHub or creating external resources.
return_required:
  - status
  - changed_paths
  - verification
  - blockers
  - handoff_summary
human_brief: >
  Build the v0.1 validator and renderer, then report verification evidence.
```
