---
layout: post
title: Building this site — Jekyll, a dark theme, and a bilingual toggle
date: 2026-08-02
summary: How the content is structured, and why the drills stay untranslated.
---

Every drill is a Markdown file with front matter for section, tâche, level and topic. The filters read those fields, so adding a facet is a data change, not a template change.

The interface switches languages; the content does not. Translating my own practice notes would double the work and halve the honesty.

The progress ticks live in localStorage. No accounts, no backend — it's a site for one person.

## Architecture decisions

I wanted the interface to feel polished but the content to feel raw. That meant investing in the theme and navigation, accepting rough Markdown for the drills.

The bilingual toggle is UI-only. French and English versions of the drills would create maintenance debt I don't need.
