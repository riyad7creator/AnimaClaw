# AnimaClaw — Agent Documentation

AnimaClaw v1.7 ships with 4 production-ready specialized agents. Each agent has a defined system prompt, tool set, memory scope, and tier assignment.

---

## 1. Content Agent

**Type:** `content`
**Tier:** Free
**Languages:** English, French, Arabic

### Capabilities
- TikTok and Instagram Reels script generation
- SEO-optimized blog post creation
- Platform-specific content formatting
- Hashtag and keyword suggestions
- Multi-language content (EN/FR/AR)

### System Prompt
```
You are a content creation specialist. Generate platform-specific content
optimized for engagement. Support TikTok, Instagram Reels, YouTube Shorts,
and blog posts. Always include SEO keywords and hashtag suggestions.
```

### Tools
| Tool | Purpose |
|------|---------|
| `web-search` | Research trending topics and competitors |
| `seo-analyzer` | Keyword density and SEO score analysis |
| `content-formatter` | Platform-specific formatting (character limits, structure) |
| `hashtag-generator` | Generate relevant hashtags by niche |

### Memory Scope: `content-projects`
Stores: project briefs, brand voice guidelines, past performance metrics, content calendar.

### Use Cases
- Generate a week of TikTok scripts for a skincare brand
- Write an SEO blog post about AI productivity tools
- Create bilingual (FR/AR) social media campaigns for Algeria market

---

## 2. Research Agent

**Type:** `research`
**Tier:** Pro
**Languages:** English, French

### Capabilities
- Deep web research with source verification
- Fact-checking with citation building
- Competitive analysis reports
- Structured research briefs with confidence scores
- Cross-referencing claims across multiple sources

### System Prompt
```
You are a research analyst. Conduct thorough research with source verification.
Always cite sources, cross-reference claims, and flag unverified information.
Produce structured research briefs.
```

### Tools
| Tool | Purpose |
|------|---------|
| `web-search` | Multi-source web research |
| `fact-checker` | Verify claims against known databases |
| `citation-builder` | Generate proper citations (APA, MLA, inline) |
| `summary-engine` | Distill long content into structured summaries |

### Memory Scope: `research-data`
Stores: research findings, source reliability scores, topic knowledge graphs.

### Use Cases
- Market research for a SaaS launch in North Africa
- Competitive analysis of AI agent platforms
- Due diligence report on a potential business partner

---

## 3. Customer Service Agent

**Type:** `support`
**Tier:** Pro
**Languages:** English, French, Arabic

### Capabilities
- Multi-language customer support (auto-detects language)
- CRM integration for ticket management
- Knowledge base lookup for instant answers
- Escalation routing for complex issues
- Brand voice maintenance across all interactions

### System Prompt
```
You are a customer service representative. Respond professionally in the
customer's language (English, French, or Arabic). Escalate complex issues.
Log all interactions to CRM. Maintain brand voice.
```

### Tools
| Tool | Purpose |
|------|---------|
| `crm-connector` | Read/write customer records and tickets |
| `ticket-manager` | Create, update, and close support tickets |
| `language-detector` | Auto-detect customer language |
| `knowledge-base` | Search product docs and FAQ |

### Memory Scope: `customer-interactions`
Stores: customer history, common issues, resolution patterns, satisfaction scores.

### Use Cases
- Handle support emails in French and Arabic for an Algerian e-commerce site
- Auto-respond to common questions from knowledge base
- Escalate billing disputes with full context to human agents

---

## 4. Workflow Agent

**Type:** `orchestrator`
**Tier:** Enterprise
**Languages:** English

### Capabilities
- Multi-step task orchestration (research -> write -> review -> publish)
- Agent delegation and result collection
- Pipeline state management with progress tracking
- Quality gates between pipeline stages
- Final deliverable assembly from component outputs

### System Prompt
```
You are a workflow orchestrator. Break complex tasks into sequential steps,
delegate to specialized agents, collect results, and assemble final
deliverables. Track progress at each stage.
```

### Tools
| Tool | Purpose |
|------|---------|
| `agent-dispatcher` | Send subtasks to specialized agents |
| `pipeline-manager` | Track multi-step workflow state |
| `quality-checker` | Validate output quality before proceeding |
| `publisher` | Publish final deliverables to configured channels |

### Memory Scope: `workflow-state`
Stores: pipeline definitions, stage results, quality scores, delivery history.

### Use Cases
- Content pipeline: Research topic -> Draft article -> SEO review -> Publish
- Client onboarding: Collect info -> Setup workspace -> Configure agents -> Send welcome
- Report generation: Gather data -> Analyze -> Write report -> Email to stakeholders

---

## Adding Custom Agents

See [CONTRIBUTING.md](../CONTRIBUTING.md) for instructions on adding new agents.

Key steps:
1. Define the agent in `AnimaAgentList.tsx`
2. Create a system prompt optimized for the task
3. Register required tools
4. Assign a tier (Free, Pro, or Enterprise)
5. Set a memory scope for context isolation

---

*AnimaClaw v1.7 — AI Agents That Actually Work*
