---
name: refine-ticket
description: Refine a backlog ticket so it is ready to implement. Use when grooming issues in Linear, GitHub or Jira.
---

# Refine a ticket

For the given ticket, propose (do not apply) updates covering:

- **Problem** in one or two sentences, and the user-visible outcome.
- **Acceptance criteria** as a checklist of testable statements.
- **Scope**: what is explicitly out.
- **Size**: S / M / L with a one-line reason; if L, propose a split.
- **Open questions** that block implementation, addressed to a human.
- **Ready?** yes only if there are no open questions.

Output the proposal as a patch to the ticket body plus a short rationale. Never mark a ticket ready or edit it directly; a human approves the update.
