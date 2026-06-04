from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT_PATH = "AI_Research_Assistant_15_20_Page_Business_Report.pdf"


def para(text, style):
    return Paragraph(text, style)


def bullet_list(items, style):
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=12) for item in items],
        bulletType="bullet",
        leftIndent=18,
        bulletFontSize=7,
    )


def make_table(data, widths, header=True):
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("LEADING", (0, 0), (-1, -1), 10.8),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        commands.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#12315f")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]
        )
    t.setStyle(TableStyle(commands))
    return t


def add_page(story, title, body_style, heading_style, sections):
    story.append(para(title, heading_style))
    for item in sections:
        kind = item[0]
        value = item[1]
        if kind == "p":
            story.append(para(value, body_style))
        elif kind == "bullets":
            story.append(bullet_list(value, body_style))
            story.append(Spacer(1, 6))
        elif kind == "table":
            story.append(make_table(value[0], value[1]))
            story.append(Spacer(1, 8))
        elif kind == "callout":
            story.append(para(value, item[2]))
    story.append(PageBreak())


def build_report():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#12315f"),
        spaceAfter=10,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4b5563"),
        spaceAfter=18,
    )
    heading_style = ParagraphStyle(
        "Heading",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#12315f"),
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.3,
        leading=13.5,
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=7,
    )
    callout_style = ParagraphStyle(
        "Callout",
        parent=body_style,
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0f5132"),
        backColor=colors.HexColor("#e9f7ef"),
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=9,
    )
    small_style = ParagraphStyle(
        "Small",
        parent=body_style,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#4b5563"),
    )

    story = [
        para("AI Research Assistant SaaS", title_style),
        para("15-20 Page Detailed Real-World Business Readiness Report", subtitle_style),
        make_table(
            [
                ["Report item", "Details"],
                ["Project", "AI Research Assistant SaaS"],
                ["Current stage", "Working MVP / prototype"],
                ["Primary value", "Upload documents and ask AI questions using document-grounded retrieval."],
                ["Best early market", "Students, researchers, freelancers, consultants, and small teams."],
                ["Overall business rating", "6.2 / 10"],
                ["MVP grade", "B-"],
                ["Real SaaS grade today", "C+"],
                ["Potential after improvements", "A-"],
            ],
            [1.7 * inch, 4.8 * inch],
        ),
        Spacer(1, 14),
        para(
            "This expanded report evaluates the project as a real-world business product, not only as a coding project. It covers market fit, customers, product features, architecture, security, scalability, monetization, operational readiness, roadmap, and final scoring.",
            body_style,
        ),
        para(
            "The assessment is based on the current project files in E:/AI-Research-Assistant, including the FastAPI backend, React frontend, document upload workflow, FAISS vector storage, RAG services, authentication, and chat history implementation.",
            small_style,
        ),
        PageBreak(),
    ]

    add_page(
        story,
        "1. Executive Summary",
        body_style,
        heading_style,
        [
            ("p", "The AI Research Assistant SaaS project has a practical and marketable concept: users upload documents, then ask AI-powered questions based on the uploaded content. This is a real need because many people spend significant time reading, searching, summarizing, and extracting insights from PDFs, text files, screenshots, and image-based documents."),
            ("p", "The product already includes the core MVP loop. A user can create an account, log in, upload files, process documents into chunks, store embeddings in a FAISS vector store, ask questions, receive AI answers, and maintain chat history. That makes the project more complete than a simple chatbot demo."),
            ("p", "From a business perspective, the project is strong enough for demonstrations, academic evaluation, portfolio presentation, and early user validation. It is not yet ready for broad commercial launch because production SaaS requires deployment reliability, strict data security, file safety, cost controls, billing, observability, and scalable storage."),
            ("callout", "Final executive verdict: promising MVP with real business potential, but it needs production hardening before it can safely serve paying business users.", callout_style),
            ("table", ([
                ["Category", "Assessment"],
                ["Business idea", "Strong and easy to explain."],
                ["Product maturity", "MVP stage."],
                ["Commercial readiness", "Low to medium today."],
                ["Best next action", "Harden the core workflow before adding advanced features."],
            ], [1.7 * inch, 4.8 * inch])),
        ],
    )

    add_page(
        story,
        "2. Product Concept and Vision",
        body_style,
        heading_style,
        [
            ("p", "The product vision is to become a document intelligence assistant. Instead of forcing users to manually read every uploaded file, the system should help them understand, search, summarize, and reuse knowledge from their documents."),
            ("p", "The current implementation focuses on question answering. This is a strong first use case because it creates immediate value: users ask a question and get a direct response. Over time, the same foundation can support summaries, comparison between documents, citations, report generation, knowledge base search, and team collaboration."),
            ("bullets", [
                "Core promise: save time while reading and analyzing documents.",
                "User experience goal: upload a document, ask a question, get a useful answer quickly.",
                "Business goal: convert repeated research work into a paid productivity workflow.",
                "Long-term direction: move from single-document chat to secure team knowledge intelligence.",
            ]),
            ("table", ([
                ["Layer", "Current direction", "Future opportunity"],
                ["Document upload", "PDF, TXT, and image support", "Batch upload, folders, tagging, and file versioning"],
                ["AI chat", "Ask questions over one document", "Multi-document chat and cited answers"],
                ["History", "Previous chats saved", "Searchable sessions and exportable reports"],
                ["User accounts", "Basic authentication", "Teams, roles, billing, and admin controls"],
            ], [1.25 * inch, 2.35 * inch, 2.9 * inch])),
        ],
    )

    add_page(
        story,
        "3. Real-World Problem Analysis",
        body_style,
        heading_style,
        [
            ("p", "The real-world problem is information overload. Users often have long research papers, proposals, resumes, technical documents, screenshots, manuals, or internal documents. Reading everything manually is slow, and normal keyword search does not always answer natural-language questions."),
            ("p", "An AI research assistant can reduce this friction by retrieving relevant sections and generating a plain-language answer. This is especially useful when the user does not know the exact keyword to search for, or when the answer is spread across multiple sections of a document."),
            ("table", ([
                ["User pain point", "Business meaning", "Product response"],
                ["Too much reading", "Time loss and lower productivity", "AI answers from document context"],
                ["Hard to find exact information", "Manual search is inefficient", "Semantic vector retrieval"],
                ["Image/PDF text is not always easy to search", "Important data can be hidden", "Text extraction and OCR"],
                ["Research questions repeat", "Users need continuity", "Chat history and editable questions"],
            ], [1.7 * inch, 2.0 * inch, 2.8 * inch])),
            ("callout", "This is a legitimate business problem because saving time on document research can translate directly into productivity gains.", callout_style),
        ],
    )

    add_page(
        story,
        "4. Target Customer Segments",
        body_style,
        heading_style,
        [
            ("p", "The product can serve many audiences, but a startup or early project should not try to serve everyone at once. The best target segment is the group that has a painful document workflow, low adoption friction, and clear willingness to test the product."),
            ("table", ([
                ["Segment", "Need", "Fit today", "Notes"],
                ["Students", "Understand PDFs and notes", "High", "Easy adoption but lower payment ability."],
                ["Researchers", "Read papers and reports faster", "High", "Strong use case for summaries and citations."],
                ["Freelancers", "Analyze client documents", "Medium", "Good if export/report features are added."],
                ["Small teams", "Search internal documents", "Medium", "Needs team permissions and stronger security."],
                ["Legal/compliance", "Query contracts and policies", "Low today", "High-value but requires much stronger accuracy and privacy."],
                ["Enterprise", "Internal knowledge search", "Low today", "Requires SSO, audit logs, admin controls, and compliance."],
            ], [1.1 * inch, 1.55 * inch, 0.9 * inch, 2.95 * inch])),
            ("p", "Recommended early segment: students, independent researchers, and small professional teams. These users can validate the core value without requiring enterprise-level compliance from day one."),
        ],
    )

    add_page(
        story,
        "5. Current Feature Review",
        body_style,
        heading_style,
        [
            ("p", "The MVP has a meaningful feature set. It supports user authentication, document upload, document listing, AI question answering, chat history, question editing, and chat deletion. These are important because they form a complete basic product journey."),
            ("table", ([
                ["Feature", "Status", "Business value"],
                ["Signup/login", "Built", "Creates user accounts and protects access."],
                ["Protected route", "Built", "Prevents anonymous users from reaching chat workflow."],
                ["Document upload", "Built", "Core user action and product entry point."],
                ["PDF/TXT/image support", "Built", "Broadens practical use cases."],
                ["OCR", "Built", "Allows image text extraction."],
                ["Vector search", "Built", "Enables semantic retrieval."],
                ["AI answer generation", "Built", "Primary value experience."],
                ["Chat history", "Built", "Improves continuity and retention."],
                ["Edit question", "Built", "Good productivity feature."],
                ["Clear/delete chat", "Built", "Gives user control."],
            ], [1.7 * inch, 0.9 * inch, 3.9 * inch])),
            ("p", "The current feature set is suitable for a functional demo. For real customers, the product needs a smoother onboarding flow, better empty states, clearer document processing status, and stronger error handling."),
        ],
    )

    add_page(
        story,
        "6. Missing Business Features",
        body_style,
        heading_style,
        [
            ("p", "A commercial SaaS product needs business operations features, not only product features. These are currently missing and should be planned before launch."),
            ("table", ([
                ["Missing feature", "Why it matters", "Priority"],
                ["Pricing plans", "Defines free/pro/team limits and business model.", "High"],
                ["Payment integration", "Required to collect revenue.", "High"],
                ["Usage tracking", "Controls AI/model cost and enables plan limits.", "High"],
                ["Admin dashboard", "Needed to manage users, documents, and usage.", "Medium"],
                ["Analytics", "Shows activation, retention, and conversion.", "Medium"],
                ["Support/contact flow", "Needed for real customer communication.", "Medium"],
                ["Terms/privacy policy", "Required for handling uploaded documents.", "High"],
                ["Email verification/reset", "Expected in real SaaS authentication.", "Medium"],
            ], [1.65 * inch, 3.55 * inch, 1.3 * inch])),
            ("callout", "The biggest business gap is monetization readiness: the app has no plans, billing, quota system, or cost controls yet.", callout_style),
        ],
    )

    add_page(
        story,
        "7. Technical Architecture Assessment",
        body_style,
        heading_style,
        [
            ("p", "The technology choices are reasonable for an MVP. FastAPI is suitable for API development, React is suitable for the frontend, SQLAlchemy supports database modeling, and LangChain/FAISS are common tools for RAG prototypes."),
            ("p", "The architecture becomes weaker when judged as a production SaaS. The frontend points to a hard-coded local network IP. The vector store is saved locally by document ID. Uploaded files are stored locally with original filenames. Ollama depends on a local model server. These decisions are acceptable during development but must change for production."),
            ("table", ([
                ["Component", "Current implementation", "Production recommendation"],
                ["Frontend API", "Hard-coded local IP", "Use environment variables and deployment-specific config."],
                ["Uploads", "Local uploads folder", "Use object storage with safe generated filenames."],
                ["Vector DB", "Local FAISS folders", "Use managed vector DB or tenant-aware scalable storage."],
                ["LLM", "Local Ollama llama3", "Deploy managed inference or controlled model server."],
                ["Processing", "Runs during upload", "Move to background worker queue."],
                ["Database", "SQLAlchemy models", "Add migrations, constraints, and production DB operations."],
            ], [1.35 * inch, 2.55 * inch, 2.6 * inch])),
        ],
    )

    add_page(
        story,
        "8. Security and Privacy Assessment",
        body_style,
        heading_style,
        [
            ("p", "Security is the most important gap before real business use. Users may upload sensitive documents, so the product must protect files, indexes, chats, and user accounts. Even a small document assistant needs strong tenant isolation."),
            ("table", ([
                ["Risk", "Severity", "Impact", "Fix"],
                ["Weak ownership checks", "High", "Users may access another user's document by ID.", "Filter every document/chat/vector action by current user."],
                ["Original filenames", "Medium", "Filename collisions or unsafe paths.", "Use UUID filenames and sanitize metadata."],
                ["Token logging", "Medium", "Tokens may leak in logs.", "Remove debug token prints."],
                ["Dangerous FAISS loading", "High", "Tampered index files could be unsafe.", "Restrict index paths and never load untrusted vector files."],
                ["No retention policy", "Medium", "Sensitive documents may remain forever.", "Add delete cleanup and retention settings."],
                ["No rate limiting", "Medium", "Abuse can raise compute cost.", "Add per-user and per-IP rate limits."],
            ], [1.35 * inch, 0.7 * inch, 2.2 * inch, 2.25 * inch])),
            ("callout", "Production launch should wait until document ownership checks and safer file handling are fixed.", callout_style),
        ],
    )

    add_page(
        story,
        "9. Scalability and Performance",
        body_style,
        heading_style,
        [
            ("p", "The current app can work on one machine for a small demo. In a real SaaS environment, multiple users may upload documents at the same time, files may be large, embeddings may take time, and AI responses may be slow or expensive."),
            ("p", "The upload endpoint currently processes the file, extracts text, chunks it, and creates the vector store as part of the request flow. That is simple, but it can make uploads slow and fragile. A production app should use background jobs and expose processing status."),
            ("bullets", [
                "Use background workers for document processing.",
                "Add a queue for embedding jobs.",
                "Show users document states: uploaded, processing, ready, failed.",
                "Store files in cloud object storage.",
                "Use a scalable vector storage strategy.",
                "Add caching for repeated questions or repeated retrieval operations.",
                "Add monitoring for response time, failed uploads, and model failures.",
            ]),
            ("p", "Scalability rating today: 4.5 / 10. It is fine for an MVP, but not strong enough for many simultaneous paying users."),
        ],
    )

    add_page(
        story,
        "10. User Experience Review",
        body_style,
        heading_style,
        [
            ("p", "The UI is functional and includes responsive behavior, sidebar navigation, upload controls, chat bubbles, loading states, and document history. This gives the project a real product feel rather than a backend-only demo."),
            ("p", "The user experience can be improved by reducing reloads, showing clearer upload status, saving file names correctly after upload, adding onboarding guidance, and making error messages more helpful."),
            ("table", ([
                ["UX area", "Current quality", "Improvement"],
                ["Login/signup", "Functional", "Add validation, password reset, and email verification."],
                ["Upload", "Usable", "Show selected file, processing status, size limits, and errors."],
                ["Chat", "Good MVP", "Add citations, answer confidence, copy/export, and retry."],
                ["Documents list", "Useful", "Add search, tags, date, file size, and status."],
                ["Empty state", "Basic", "Use stronger guidance and sample flow."],
                ["Mobile layout", "Responsive", "Check long text wrapping and sidebar ergonomics."],
            ], [1.45 * inch, 1.15 * inch, 3.9 * inch])),
            ("p", "UX rating today: 6.5 / 10. The interface is usable, but more polish is needed for paying users."),
        ],
    )

    add_page(
        story,
        "11. Market and Competitive Positioning",
        body_style,
        heading_style,
        [
            ("p", "The AI document assistant market is attractive but competitive. General AI tools can already summarize and answer questions from uploaded files. Therefore, this project should avoid broad positioning like 'AI assistant for everyone' and instead focus on a specific workflow or audience."),
            ("table", ([
                ["Positioning", "Advantages", "Challenges"],
                ["Student research assistant", "Easy adoption, strong need, simple messaging.", "Lower payment capacity."],
                ["Research paper assistant", "Clear workflow and repeat usage.", "Needs citations and source reliability."],
                ["Small business document assistant", "Higher payment potential.", "Needs stronger security and team features."],
                ["Legal document assistant", "High-value use case.", "Requires compliance, accuracy, and audit trails."],
                ["Internal knowledge assistant", "Strong team value.", "Needs permissions and enterprise features."],
            ], [1.65 * inch, 2.45 * inch, 2.4 * inch])),
            ("callout", "Recommended positioning: start as an AI research/document assistant for students, researchers, and small professional teams.", callout_style),
        ],
    )

    add_page(
        story,
        "12. Monetization Plan",
        body_style,
        heading_style,
        [
            ("p", "The current project does not include monetization features, but the product can be monetized through a usage-based SaaS model. Since AI and embedding workloads create compute cost, the pricing model should include usage limits."),
            ("table", ([
                ["Plan", "Target", "Limits", "Business purpose"],
                ["Free", "Trial users and students", "Small document limit and daily question cap", "User acquisition and validation."],
                ["Pro", "Researchers and freelancers", "Higher document/question limits", "Main individual revenue plan."],
                ["Team", "Small companies", "Shared workspace and admin billing", "Higher retention and ARPU."],
                ["Enterprise", "Compliance-heavy buyers", "Custom deployment, audit logs, SSO", "Premium long-term segment."],
            ], [1.0 * inch, 1.5 * inch, 2.15 * inch, 2.85 * inch])),
            ("bullets", [
                "Track number of documents uploaded per user.",
                "Track number of AI questions per day/month.",
                "Track storage consumption.",
                "Limit maximum file size by plan.",
                "Add Stripe or another payment provider only after usage tracking is in place.",
            ]),
        ],
    )

    add_page(
        story,
        "13. Operational Readiness",
        body_style,
        heading_style,
        [
            ("p", "A real SaaS needs operational systems that are invisible to users but critical for reliability. This includes deployment, logs, monitoring, backups, alerts, migrations, and support workflows."),
            ("table", ([
                ["Operational area", "Current status", "Needed for business"],
                ["Deployment", "Incomplete", "Production hosting, environment configs, domain, SSL."],
                ["Docker", "docker-compose.yml is empty", "Container setup for backend, frontend, database, worker, and model service."],
                ["Database migrations", "Alembic exists", "Use migration workflow instead of create_all in production."],
                ["Logging", "Debug prints", "Structured logs without sensitive token data."],
                ["Monitoring", "Missing", "Track uptime, latency, failed jobs, model failures."],
                ["Backups", "Missing", "Database and file/vector backup strategy."],
                ["Support", "Missing", "Contact/support flow and issue tracking."],
            ], [1.6 * inch, 2.0 * inch, 2.9 * inch])),
            ("p", "Operational readiness rating today: 4 / 10. This is expected for an MVP, but it must improve before launch."),
        ],
    )

    add_page(
        story,
        "14. SWOT Analysis",
        body_style,
        heading_style,
        [
            ("table", ([
                ["Strengths", "Weaknesses"],
                [
                    "Clear product concept; working MVP flow; modern technology stack; document upload support; RAG pipeline; chat history; responsive interface.",
                    "Hard-coded frontend API URL; local vector and file storage; no billing; no automated tests; incomplete deployment; security hardening needed.",
                ],
                ["Opportunities", "Threats"],
                [
                    "Can serve students, researchers, freelancers, small teams, education, HR, legal, and internal knowledge use cases after focused improvements.",
                    "Crowded AI market; users expect high accuracy; privacy concerns; model costs; large competitors can offer similar features.",
                ],
            ], [3.25 * inch, 3.25 * inch])),
            ("p", "The SWOT conclusion is clear: the opportunity is real, but differentiation and trust will matter. The project should focus on one user segment, deliver a smooth workflow, and make privacy/security a visible strength."),
        ],
    )

    add_page(
        story,
        "15. Detailed Rating Breakdown",
        body_style,
        heading_style,
        [
            ("table", ([
                ["Area", "Rating", "Detailed reason"],
                ["Business idea", "8 / 10", "The use case is strong, understandable, and useful across many document-heavy workflows."],
                ["MVP completeness", "7 / 10", "The core workflow exists: auth, upload, embeddings, chat, and history."],
                ["User experience", "6.5 / 10", "Functional and responsive, but needs smoother onboarding and clearer states."],
                ["Technical architecture", "6 / 10", "Good MVP stack, but local storage and hard-coded config weaken production readiness."],
                ["Security readiness", "4.5 / 10", "Needs strict ownership checks, safe file handling, token log cleanup, and retention policy."],
                ["Scalability", "4.5 / 10", "Local FAISS and local uploads limit multi-server SaaS growth."],
                ["Deployment readiness", "4 / 10", "Needs Docker/cloud deployment, environment config, and production database workflow."],
                ["Monetization readiness", "3.5 / 10", "No billing, plans, usage tracking, quotas, or customer admin workflow."],
                ["Overall", "6.2 / 10", "A promising MVP, but not yet a production-grade SaaS business."],
            ], [1.45 * inch, 0.75 * inch, 4.3 * inch])),
            ("callout", "Final rating: 6.2 / 10. Strong enough to present as an MVP; not ready yet for commercial launch.", callout_style),
        ],
    )

    add_page(
        story,
        "16. Roadmap to Production",
        body_style,
        heading_style,
        [
            ("p", "The best roadmap is to improve the existing product foundation before adding too many new features. The first priority is trust and deployability."),
            ("table", ([
                ["Phase", "Goal", "Key actions"],
                ["Phase 1", "Security and configuration", "Environment-based API URL, ownership checks, safe filenames, remove token logs, file validation."],
                ["Phase 2", "Reliability", "Background jobs, processing statuses, better errors, logging, tests, CI."],
                ["Phase 3", "Scalable storage", "Object storage, production vector database, backup strategy, cleanup on delete."],
                ["Phase 4", "SaaS business layer", "Plans, billing, quotas, admin dashboard, analytics, support."],
                ["Phase 5", "Advanced product value", "Citations, summaries, exports, multi-document chat, team workspaces."],
            ], [1.05 * inch, 1.8 * inch, 3.65 * inch])),
            ("p", "The roadmap should be executed in this order because a business cannot safely scale or monetize a product before it can protect customer data and run reliably."),
        ],
    )

    add_page(
        story,
        "17. Final Business Conclusion",
        body_style,
        heading_style,
        [
            ("p", "The AI Research Assistant SaaS project is a credible MVP. It has a real problem, a usable core workflow, and a technology stack that fits the product category. The project would present well as a portfolio project, academic submission, or startup prototype."),
            ("p", "As a real-world business, the project is currently early. The main limitations are not the idea; the idea is good. The limitations are production readiness, security, deployment, scalable storage, operational controls, and monetization features."),
            ("p", "The recommended next step is to harden the existing upload-to-chat workflow. That means secure document access, safe file storage, environment-based configuration, deployment setup, automated tests, background processing, and usage tracking."),
            ("p", "Once the foundation is stronger, the project can add paid plans, export features, citations, summaries, team workspaces, and analytics. At that point, it could become a serious small SaaS product for research and document productivity."),
            ("callout", "Final grade: B- as an MVP, C+ as a real SaaS today, and A- potential after production hardening and monetization.", callout_style),
            ("p", "Prepared from the current project files in E:/AI-Research-Assistant.",),
        ],
    )

    if story and isinstance(story[-1], PageBreak):
        story.pop()

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=LETTER,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
        title="AI Research Assistant 15-20 Page Business Report",
        author="Codex",
    )
    doc.build(story)


if __name__ == "__main__":
    build_report()
