

## Expandable User Stories in Epics Page

Add the ability to click on any epic card to expand it and reveal its underlying user stories, similar to the expandable rows in the Gantt chart.

---

### Overview

When you click on an epic card, it will expand to show all associated user stories with their status, priority, and story points. Clicking again will collapse the stories back.

---

### Implementation Details

#### 1. Update EpicsPage.tsx

**Add state management for expanded epics:**
- Track which epics are currently expanded using a `Set<string>` state
- Add toggle function to expand/collapse individual epics
- Add "Expand All" / "Collapse All" button for convenience

**Modify epic cards to be expandable:**
- Add click handler to the story count area or a dedicated expand button
- Add chevron icon (ChevronRight/ChevronDown) to indicate expand state
- Change layout from grid cards to a list format that better accommodates expansion

**Add story list section when expanded:**
- Display stories in a compact list format below the epic header
- Show story title, status badge, priority badge, and story points
- Click on a story to open the detail dialog (reuse pattern from StoriesPage)
- Use Collapsible component from Radix for smooth animations

#### 2. Files to Modify

| File | Changes |
|------|---------|
| `src/pages/EpicsPage.tsx` | Add expand/collapse state, modify card layout, add story list rendering |

#### 3. Visual Design

**Collapsed Epic Card:**
```text
┌────────────────────────────────────────────┐
│ Q1  Sprint 1           [Edit] [Delete]     │
│ Epic Title                                 │
│ Description...                             │
│ ─────────────────────────────────────────  │
│ SMBC-GIC  Model        ▶ 5 stories         │
└────────────────────────────────────────────┘
```

**Expanded Epic Card:**
```text
┌────────────────────────────────────────────┐
│ Q1  Sprint 1           [Edit] [Delete]     │
│ Epic Title                                 │
│ Description...                             │
│ ─────────────────────────────────────────  │
│ SMBC-GIC  Model        ▼ 5 stories         │
├────────────────────────────────────────────┤
│   ○ Story 1 Title          Must   3 pts    │
│   ● Story 2 Title          Should 5 pts    │
│   ○ Story 3 Title          Could  2 pts    │
│   ...                                      │
└────────────────────────────────────────────┘
```

#### 4. Features

- **Expand indicator**: Chevron icon that rotates when expanded
- **Story count clickable**: Click the "X stories" area to toggle
- **Status colors**: Stories show status with colored badges (Draft, Ready, In Progress, Done)
- **Priority colors**: Priority badges use existing theme colors
- **Story details**: Click any story row to open the full story detail dialog
- **Smooth animation**: Use Collapsible component for expand/collapse animation
- **Generate prompt**: If epic has 0 stories, show "Generate" link when expanded

---

### Technical Approach

1. **State management**: Use `useState<Set<string>>` to track expanded epic IDs
2. **Toggle function**: Add/remove epic IDs from the Set on click
3. **Collapsible wrapper**: Wrap story list in `<Collapsible>` with `<CollapsibleContent>` for animation
4. **Story click handler**: Reuse the story detail dialog pattern from StoriesPage
5. **Helper functions**: Import `getStatusColorClass` from ganttUtils for consistent styling

