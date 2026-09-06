const fs = require('fs');
const path = require('path');

const users = [
  {
    id: "usr_owner_01",
    name: "Alex Morgan",
    email: "alex.morgan@acme.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    systemRole: "owner",
    jobTitle: "VP of Product Architecture",
    department: "Product"
  },
  {
    id: "usr_admin_02",
    name: "Sarah Chen",
    email: "sarah.chen@acme.io",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256",
    systemRole: "admin",
    jobTitle: "Lead Principal Engineer",
    department: "Engineering"
  },
  {
    id: "usr_member_03",
    name: "Marcus Vance",
    email: "marcus.vance@acme.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    systemRole: "member",
    jobTitle: "Senior Fullstack Engineer",
    department: "Engineering"
  },
  {
    id: "usr_viewer_04",
    name: "Elena Rostova",
    email: "elena.rostova@acme.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
    systemRole: "viewer",
    jobTitle: "Principal Product Designer",
    department: "Design"
  }
];

const workspaces = [
  {
    id: "ws_tech_01",
    name: "Acme Tech & Product Platform",
    icon: "code",
    color: "#3B82F6",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03", "usr_viewer_04"],
    defaultView: "board",
    ownerId: "usr_owner_01"
  },
  {
    id: "ws_mktg_02",
    name: "Global Growth & Brand Ops",
    icon: "sparkles",
    color: "#EC4899",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03", "usr_viewer_04"],
    defaultView: "list",
    ownerId: "usr_owner_01"
  }
];

const projects = [
  {
    id: "proj_mobile_01",
    workspaceId: "ws_tech_01",
    name: "Next-Gen Mobile Application",
    description: "Cross-platform iOS & Android rebuild targeting 60fps animations and seamless offline synchronization.",
    icon: "smartphone",
    color: "#6366F1",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03", "usr_viewer_04"],
    leadId: "usr_admin_02",
    isArchived: false
  },
  {
    id: "proj_ds_02",
    workspaceId: "ws_tech_01",
    name: "Design System 3.0 Refactor",
    description: "Unified tokenized component library built with Tailwind CSS, Radix UI primitives, and dark mode dynamics.",
    icon: "palette",
    color: "#8B5CF6",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03"],
    leadId: "usr_viewer_04",
    isArchived: false
  },
  {
    id: "proj_cloud_03",
    workspaceId: "ws_tech_01",
    name: "Cloud Core & Realtime Engine",
    description: "High-throughput Edge API runtime, WebSocket state synchronization, and immutable client event log store.",
    icon: "cloud",
    color: "#06B6D4",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03"],
    leadId: "usr_admin_02",
    isArchived: false
  },
  {
    id: "proj_brand_04",
    workspaceId: "ws_mktg_02",
    name: "Q4 Global Rebranding Campaign",
    description: "Complete overhaul of corporate visual identity, tone of voice guidelines, media assets, and press kits.",
    icon: "megaphone",
    color: "#F59E0B",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03", "usr_viewer_04"],
    leadId: "usr_owner_01",
    isArchived: false
  },
  {
    id: "proj_launch_05",
    workspaceId: "ws_mktg_02",
    name: "Enterprise Summit 2026 Keynote",
    description: "Annual developer & executive customer conference presentation, interactive demos, and keynote collateral.",
    icon: "ticket",
    color: "#10B981",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_viewer_04"],
    leadId: "usr_owner_01",
    isArchived: false
  },
  {
    id: "proj_cx_06",
    workspaceId: "ws_mktg_02",
    name: "Customer Journey & Analytics Hub",
    description: "User retention telemetry, Net Promoter Score feedback aggregation, and onboarding conversion funnels.",
    icon: "pie-chart",
    color: "#EF4444",
    memberIds: ["usr_owner_01", "usr_admin_02", "usr_member_03", "usr_viewer_04"],
    leadId: "usr_admin_02",
    isArchived: true
  }
];

const taskTemplates = {
  proj_mobile_01: [
    { title: "Implement Biometric Auth Flow (FaceID / TouchID)", desc: "Integrate Native Keychain API with fallback PIN authentication for iOS & Android.", status: "in_progress", priority: "urgent", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Security", "Mobile", "Auth"] },
    { title: "Optimize Offline SQLite Cache Synchronization", desc: "Ensure optimistic UI updates automatically queue and retry failed payload syncs upon network recovery.", status: "in_review", priority: "high", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["Offline", "Database"] },
    { title: "Design Mobile Navigation Drawer & Bottom Tabs", desc: "Create responsive gesture-driven drawer navigation with smooth spring physics animations.", status: "done", priority: "medium", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["UI/UX", "Navigation"] },
    { title: "Configure Push Notifications with FCM & APNS", desc: "Set up silent background data pushes and user interaction handlers.", status: "todo", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Notifications", "Backend"] },
    { title: "Audit Mobile Memory Leaks in Video Player", desc: "Investigate texture buffer allocation overhead on long scrollable feed lists.", status: "todo", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_member_03", reporter: "usr_admin_02", labels: ["Performance", "Debugging"] },
    { title: "Implement Deep Linking Scheme (`acme://task/:id`)", desc: "Enable universal links for external web previews and email notification redirects.", status: "in_progress", priority: "low", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Routing", "DX"] },
    { title: "Add Haptic Feedback to Task Gesture Swipe Actions", desc: "Integrate subtle tactile vibration on swipe-to-complete and drag-and-drop ordering.", status: "done", priority: "low", assignee: "usr_viewer_04", reviewer: "usr_admin_02", reporter: "usr_member_03", labels: ["UI/UX", "Micro-Interactions"] },
    { title: "Setup Automated iOS App Store Fastlane Deployments", desc: "Script TestFlight build releases tied to main branch GitHub merge events.", status: "todo", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["DevOps", "CI/CD"] },
    { title: "Build In-App Crash Reporting & Sentry Diagnostics", desc: "Capture JS runtime exceptions and native stack traces with contextual breadcrumbs.", status: "in_review", priority: "urgent", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Monitoring", "Stability"] },
    { title: "Refactor Dark Mode Color Tokens for OLED Displays", desc: "Replace dark gray backgrounds with true black `#000000` accents for battery optimization.", status: "todo", priority: "low", assignee: "usr_viewer_04", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Design System", "Theme"] }
  ],
  proj_ds_02: [
    { title: "Migrate Color Palette to Tailwind v4 CSS Variables", desc: "Refactor root theme variables to OKLCH color space for dynamic contrast adjustment.", status: "in_progress", priority: "urgent", assignee: "usr_admin_02", reviewer: "usr_viewer_04", reporter: "usr_owner_01", labels: ["Tailwind", "CSS"] },
    { title: "Build Accessible Data Table Component with Resizable Columns", desc: "Construct WCAG AAA compliant grid component with sorting, filtering, and keyboard navigation.", status: "in_review", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_viewer_04", labels: ["Accessibility", "Components"] },
    { title: "Create Interactive Command Palette (`Cmd + K`) Modal", desc: "Implement fuzzy search dialog for quick navigation across workspaces, tasks, and users.", status: "done", priority: "high", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_member_03", labels: ["UX", "Keyboard"] },
    { title: "Publish Storybook 8 Documentation & Live Demos", desc: "Generate auto-updating component documentation site hosted on Cloudflare Pages.", status: "todo", priority: "medium", assignee: "usr_viewer_04", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Docs", "Storybook"] },
    { title: "Design Glassmorphism Modal Dialog Primitive", desc: "Build backdrop-filter blur modal overlays with subtle noise textures and smooth scale-in transitions.", status: "done", priority: "medium", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["Styling", "Visual"] },
    { title: "Extract Reusable Rich Text Editor with Slash Commands", desc: "Integrate Tiptap headless editor with custom task mention nodes and markdown exports.", status: "in_progress", priority: "urgent", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Editor", "Feature"] },
    { title: "Add Drag-and-Drop Kanban Board Component Primitives", desc: "Leverage HTML5 Drag API with collision detection and placement feedback.", status: "todo", priority: "high", assignee: "usr_admin_02", reviewer: "usr_member_03", reporter: "usr_owner_01", labels: ["Kanban", "Interactive"] },
    { title: "Optimize Icon Library Tree-Shaking & Bundle Size", desc: "Replace heavy SVG bundle imports with dynamic inline SVG sprite system.", status: "todo", priority: "low", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_member_03", labels: ["Optimization", "Bundling"] },
    { title: "Implement Multi-Select Tag Selector & Color Picker", desc: "Construct flexible tag pill component with color picker dropdown and search filtering.", status: "done", priority: "low", assignee: "usr_viewer_04", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Form", "UI"] },
    { title: "Audit Keyboard Focus Rings Across All Interactive Buttons", desc: "Ensure focus-visible outline rings remain crisp across Chrome, Safari, and Firefox browsers.", status: "todo", priority: "low", assignee: "usr_admin_02", reviewer: "usr_viewer_04", reporter: "usr_member_03", labels: ["A11y", "QA"] }
  ],
  proj_cloud_03: [
    { title: "Architect Client-Side Redux State Persistence Layer", desc: "Configure IndexedDB backed middleware for Redux Toolkit to preserve offline workspace snapshots.", status: "in_progress", priority: "urgent", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["Redux", "Architecture"] },
    { title: "Implement Optimistic UI Mutation Pipeline", desc: "Dispatch Redux actions immediately while logging undo/redo history in state store.", status: "in_review", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["State Management", "DX"] },
    { title: "Design Event-Driven Activity Logger System", desc: "Create centralized event bus subscriber that logs all workspace mutations into local storage.", status: "done", priority: "high", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_member_03", labels: ["Audit Log", "Core"] },
    { title: "Build Client-Side Full-Text Search Engine with FlexSearch", desc: "Index workspace tasks, descriptions, and comments in memory for instantaneous search responses.", status: "todo", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_member_03", reporter: "usr_owner_01", labels: ["Search", "Performance"] },
    { title: "Construct Mock WebSockets Sync Gateway", desc: "Simulate multi-tab live sync notifications using BroadcastChannel browser API.", status: "in_progress", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_admin_02", labels: ["Realtime", "Sync"] },
    { title: "Develop Client JSON Import/Export Backup Engine", desc: "Allow users to export entire workspace store to JSON file and restore with schema validation.", status: "done", priority: "medium", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_member_03", labels: ["Data", "Export"] },
    { title: "Benchmark Large Dataset Rendering (>1,000 Tasks)", desc: "Profile React virtualization DOM list nodes using tanstack react virtual.", status: "todo", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_member_03", reporter: "usr_owner_01", labels: ["Virtualization", "Benchmark"] },
    { title: "Write Schema Validation Middleware for Redux Slices", desc: "Verify incoming state payload shapes against Zod schemas on startup.", status: "todo", priority: "low", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_admin_02", labels: ["Type Safety", "Zod"] },
    { title: "Implement Web Worker for Heavy Data Filtering & Sorting", desc: "Offload complex timeline gantt calculations off the main UI rendering thread.", status: "todo", priority: "low", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["WebWorker", "Performance"] },
    { title: "Create Automated End-to-End Test Suite with Playwright", desc: "Cover drag-and-drop task movements, filter changes, and workspace switching.", status: "todo", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Testing", "E2E"] }
  ],
  proj_brand_04: [
    { title: "Finalize 2026 Brand Guidelines Deck & Typography Rules", desc: "Publish revised brand typography system using Inter Display and JetBrains Mono fonts.", status: "done", priority: "urgent", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_owner_01", labels: ["Brand", "Design"] },
    { title: "Design High-Resolution Vector Logo Variant Package", desc: "Generate monochrome, dark-mode, icon mark, and stacked brand logo SVGs.", status: "in_progress", priority: "high", assignee: "usr_viewer_04", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Assets", "Vector"] },
    { title: "Produce Marketing Hero Video & Motion Graphics", desc: "Render 4K promo video showcasing Notion-like canvas and Jira-like project boards.", status: "in_review", priority: "urgent", assignee: "usr_member_03", reviewer: "usr_viewer_04", reporter: "usr_owner_01", labels: ["Video", "Motion"] },
    { title: "Audit Social Media Image Banners & OG Meta Tags", desc: "Create dynamic OpenGraph social share card templates for Twitter, LinkedIn, and GitHub.", status: "todo", priority: "medium", assignee: "usr_owner_01", reviewer: "usr_viewer_04", reporter: "usr_admin_02", labels: ["Social", "SEO"] },
    { title: "Refresh Corporate Email Newsletter Templates", desc: "Code responsive HTML email templates tested across Outlook, Gmail, and Apple Mail.", status: "done", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_viewer_04", labels: ["Email", "Marketing"] },
    { title: "Write Product Positioning Statement & Tone Guidelines", desc: "Document clear copy rules for enterprise vs indie developer product messaging.", status: "in_progress", priority: "medium", assignee: "usr_owner_01", reviewer: "usr_viewer_04", reporter: "usr_admin_02", labels: ["Copywriting", "Messaging"] },
    { title: "Create Merch & Swag Mockups for Developer Summit", desc: "Design branded hoodies, sticker sheets, mechanical keyboard keycaps, and water bottles.", status: "todo", priority: "low", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["Swag", "Physical"] },
    { title: "Coordinate Press Release Distribution with PR Agency", desc: "Draft launch announcement embargoed for TechCrunch, ProductHunt, and HackerNews.", status: "todo", priority: "high", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["PR", "Launch"] },
    { title: "Build Digital Brand Asset Management (DAM) Portal", desc: "Construct public web gallery for press to download high-res logos and product mockups.", status: "todo", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_viewer_04", reporter: "usr_owner_01", labels: ["Web", "Assets"] },
    { title: "Conduct Competitor Visual Identity Comparison Study", desc: "Analyze visual trends across Linear, Monday.com, Notion, and Jira Enterprise.", status: "done", priority: "low", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["Research", "Strategy"] }
  ],
  proj_launch_05: [
    { title: "Book Keynote Speakers & Finalize Conference Schedule", desc: "Confirm dates, contracts, and tech talks for 12 industry executive speakers.", status: "done", priority: "urgent", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Event", "Keynote"] },
    { title: "Build Summit 2026 Registration & Ticket Web App", desc: "Construct responsive landing page with countdown timer and calendar export links.", status: "in_progress", priority: "urgent", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["Web", "Registration"] },
    { title: "Design Conference Badge & Access Pass Artwork", desc: "Create printable RFID badge templates for VIPs, speakers, sponsors, and attendees.", status: "in_review", priority: "medium", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["Print", "Design"] },
    { title: "Set Up Live Stream Recording & Broadcasting Setup", desc: "Coordinate 4K multi-camera streaming setup for YouTube Live and Twitch broadcast.", status: "todo", priority: "high", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["A/V", "Streaming"] },
    { title: "Draft Executive Keynote Slide Deck & Product Demos", desc: "Prepare 45-minute keynote presentation outlining client-side architectural vision.", status: "in_progress", priority: "urgent", assignee: "usr_owner_01", reviewer: "usr_viewer_04", reporter: "usr_admin_02", labels: ["Slides", "Presentation"] },
    { title: "Coordinate Sponsor Booth Specifications & Assets", desc: "Send exhibitor guidelines and artwork dimension specs to 15 summit sponsors.", status: "done", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_viewer_04", labels: ["Sponsors", "Ops"] },
    { title: "Create Mobile Event Schedule Companion App", desc: "Provide attendees with real-time room schedule updates and speaker Q&A submission.", status: "todo", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Mobile", "App"] },
    { title: "Organize VIP Dinner & Executive Networking Reception", desc: "Reserve venue and confirm dietary preferences for 50 keynote speakers and sponsors.", status: "todo", priority: "low", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Event", "VIP"] },
    { title: "Publish Post-Event Survey & Feedback Form", desc: "Draft rating questions for talks, venue quality, and product demo satisfaction.", status: "todo", priority: "low", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_viewer_04", labels: ["Feedback", "Analytics"] },
    { title: "Edit Keynote Highlights Video for Social Release", desc: "Cut 90-second hype video of top event moments for LinkedIn and YouTube Shorts.", status: "todo", priority: "medium", assignee: "usr_member_03", reviewer: "usr_viewer_04", reporter: "usr_owner_01", labels: ["Video", "Social"] }
  ],
  proj_cx_06: [
    { title: "Synthesize Q3 Customer Churn & Retention Data", desc: "Analyze telemetry logs to identify top 3 friction points causing user drop-off.", status: "done", priority: "high", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_member_03", labels: ["Analytics", "Retention"] },
    { title: "Automate Post-Onboarding NPS Survey Trigger", desc: "Trigger subtle in-app rating modal after user creates their 5th active task.", status: "done", priority: "medium", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["NPS", "Automation"] },
    { title: "Redesign User Onboarding Walkthrough Tour", desc: "Build interactive step-by-step tooltip guide introducing board views and shortcuts.", status: "done", priority: "urgent", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["UX", "Onboarding"] },
    { title: "Publish Help Center Self-Service FAQ Articles", desc: "Write 15 detailed step-by-step guides covering keyboard navigation and filtering.", status: "done", priority: "medium", assignee: "usr_admin_02", reviewer: "usr_viewer_04", reporter: "usr_owner_01", labels: ["Docs", "Support"] },
    { title: "Audit Customer Support Ticket Resolution Velocity", desc: "Measure average time-to-first-response and customer satisfaction ratings.", status: "done", priority: "low", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_member_03", labels: ["Support", "Metrics"] },
    { title: "Construct User Persona Mapping & Workflow Diagrams", desc: "Document core workflows for Product Managers, Tech Leads, and Content Creators.", status: "done", priority: "medium", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["Research", "Personas"] },
    { title: "Implement Feature Request Voting Portal", desc: "Allow users to upvote requested feature enhancements and track public roadmap status.", status: "done", priority: "high", assignee: "usr_member_03", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Community", "Roadmap"] },
    { title: "Analyze Heatmap Data of Task Modal Interactions", desc: "Review click-map telemetry to optimize position of task edit action buttons.", status: "done", priority: "low", assignee: "usr_viewer_04", reviewer: "usr_owner_01", reporter: "usr_admin_02", labels: ["Telemetry", "UI"] },
    { title: "Conduct 10 One-on-One User Interviews with Power Users", desc: "Gather qualitative feedback on board view customizability and shortcut productivity.", status: "done", priority: "high", assignee: "usr_admin_02", reviewer: "usr_owner_01", reporter: "usr_viewer_04", labels: ["Interviews", "Qualitative"] },
    { title: "Draft Archival Summary Report for Customer Insights Hub", desc: "Consolidate project findings into executive summary deck prior to project archival.", status: "done", priority: "low", assignee: "usr_owner_01", reviewer: "usr_admin_02", reporter: "usr_owner_01", labels: ["Report", "Archival"] }
  ]
};

const subtaskTitles = [
  ["Review design spec", "Draft technical implementation plan", "Run unit test suite"],
  ["Perform code audit", "Add inline documentation", "Verify dark mode appearance"],
  ["Validate input schema", "Test mobile responsiveness", "Deploy preview branch"],
  ["Refactor helper functions", "Add keyboard shortcuts", "Check accessibility contrast"],
  ["Bench performance metrics", "Update storybook docs", "Notify team on Slack"]
];

const commentsList = [
  "Great progress! Let's ensure we test this thoroughly on iOS Safari.",
  "I've added the updated design specs in Figma. Take a look when you get a chance.",
  "LGTM! Tested locally and all edge cases pass cleanly.",
  "Should we consider extracting this into a reusable sub-hook for cleaner state access?",
  "This is blocked until the color tokens refactor is merged into main.",
  "Updated the subtasks list to reflect today's sync discussion.",
  "Tested on high-DPI retina display. Visuals are super crisp!"
];

const tasks = [];
const comments = [];
const activityLogs = [];
const notifications = [];

let commentCounter = 1;
let activityCounter = 1;
let notificationCounter = 1;

const baseDate = new Date("2026-09-01T10:00:00.000Z");

projects.forEach(project => {
  const templates = taskTemplates[project.id];
  templates.forEach((tmpl, idx) => {
    const taskId = `task_${project.id}_${idx + 1}`;
    const createdDate = new Date(baseDate.getTime() + (idx * 86400000 / 2)).toISOString();
    const dueDate = tmpl.status === 'done' ? null : new Date(baseDate.getTime() + ((idx + 5) * 86400000)).toISOString();
    
    const subSet = subtaskTitles[idx % subtaskTitles.length];
    const subtasks = subSet.map((stTitle, sIdx) => ({
      id: `sub_${taskId}_${sIdx + 1}`,
      title: stTitle,
      isCompleted: tmpl.status === 'done' || sIdx === 0,
      assigneeId: tmpl.assignee
    }));

    const attachments = (idx % 2 === 0) ? [
      {
        id: `att_${taskId}_1`,
        name: `${tmpl.title.split(' ')[0].toLowerCase()}_spec.pdf`,
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        type: "application/pdf",
        size: 1048576,
        uploadedAt: createdDate
      }
    ] : [];

    const taskObj = {
      id: taskId,
      projectId: project.id,
      title: tmpl.title,
      description: tmpl.desc,
      status: tmpl.status,
      priority: tmpl.priority,
      dueDate: dueDate,
      assigneeId: tmpl.assignee,
      reviewerId: tmpl.reviewer,
      reporterId: tmpl.reporter,
      labels: tmpl.labels,
      subtasks: subtasks,
      attachments: attachments,
      createdAt: createdDate
    };

    tasks.push(taskObj);

    const commenter1 = users[(idx + 1) % users.length].id;
    const commenter2 = users[(idx + 2) % users.length].id;

    const comm1 = {
      id: `comment_${commentCounter++}`,
      taskId: taskId,
      userId: commenter1,
      content: commentsList[idx % commentsList.length],
      createdAt: new Date(new Date(createdDate).getTime() + 3600000).toISOString()
    };
    const comm2 = {
      id: `comment_${commentCounter++}`,
      taskId: taskId,
      userId: commenter2,
      content: commentsList[(idx + 3) % commentsList.length],
      createdAt: new Date(new Date(createdDate).getTime() + 7200000).toISOString()
    };
    comments.push(comm1, comm2);

    const act1 = {
      id: `act_${activityCounter++}`,
      taskId: taskId,
      projectId: project.id,
      userId: tmpl.reporter,
      actionType: "task_created",
      timestamp: createdDate,
      details: "created the task"
    };

    const act2 = {
      id: `act_${activityCounter++}`,
      taskId: taskId,
      projectId: project.id,
      userId: tmpl.assignee || "usr_admin_02",
      actionType: tmpl.status === 'done' ? "status_changed" : "comment_added",
      timestamp: new Date(new Date(createdDate).getTime() + 3600000).toISOString(),
      details: tmpl.status === 'done' ? "marked task as done" : "added a comment"
    };
    activityLogs.push(act1, act2);
  });
});

users.forEach(user => {
  notifications.push(
    {
      id: `notif_${notificationCounter++}`,
      userId: user.id,
      title: "Welcome to Workspace Manager",
      message: "You have been added to Acme Tech & Product Platform workspace.",
      isRead: true,
      type: "system",
      createdAt: "2026-09-01T10:00:00.000Z"
    },
    {
      id: `notif_${notificationCounter++}`,
      userId: user.id,
      title: "Task Assigned",
      message: "You were assigned to high-priority task in Next-Gen Mobile Application.",
      isRead: false,
      type: "task_assigned",
      createdAt: "2026-09-03T14:30:00.000Z"
    },
    {
      id: `notif_${notificationCounter++}`,
      userId: user.id,
      title: "Review Requested",
      message: "Sarah Chen requested your review on 'Implement Biometric Auth Flow'.",
      isRead: false,
      type: "review_requested",
      createdAt: "2026-09-05T09:00:00.000Z"
    }
  );
});

const dataset = {
  users,
  workspaces,
  projects,
  tasks,
  comments,
  activityLogs,
  notifications,
  activeUserId: "usr_owner_01",
  activeWorkspaceId: "ws_tech_01",
  activeProjectId: null,
  searchQuery: "",
  statusFilter: "all",
  priorityFilter: "all",
  assigneeFilter: "all"
};

const outputDir = path.join(__dirname, 'mock');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'mockData.json'), JSON.stringify(dataset, null, 2));

console.log(`Successfully generated updated mock dataset with:`);
console.log(`- Users: ${users.length}`);
console.log(`- Workspaces: ${workspaces.length}`);
console.log(`- Projects: ${projects.length}`);
console.log(`- Tasks: ${tasks.length}`);
console.log(`- Comments: ${comments.length}`);
console.log(`- Activity Logs: ${activityLogs.length}`);
console.log(`- Notifications: ${notifications.length}`);
