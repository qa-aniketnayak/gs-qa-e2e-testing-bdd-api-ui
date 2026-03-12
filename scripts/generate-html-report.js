const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.resolve(process.cwd(), "reports/cucumber-report.json");
const OUTPUT_PATH = path.resolve(process.cwd(), "reports/cucumber-report.html");

const STATUS_ORDER = ["passed", "failed", "skipped", "pending", "undefined", "ambiguous", "unknown"];
const STATUS_COLORS = {
    passed: { bg: "#06b6d4", text: "#ffffff", light: "#ecfdf5" },
    failed: { bg: "#f43f5e", text: "#ffffff", light: "#ffe0e6" },
    skipped: { bg: "#a78bfa", text: "#ffffff", light: "#f3f0ff" },
    pending: { bg: "#f97316", text: "#ffffff", light: "#fff7ed" },
    undefined: { bg: "#3b82f6", text: "#ffffff", light: "#eff6ff" },
    ambiguous: { bg: "#ec4899", text: "#ffffff", light: "#fdf2f8" },
    unknown: { bg: "#64748b", text: "#ffffff", light: "#f1f5f9" }
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizeStatus(status) {
    const normalized = String(status ?? "unknown").toLowerCase();
    return STATUS_ORDER.includes(normalized) ? normalized : "unknown";
}

function titleCase(value) {
    return String(value ?? "")
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatDuration(durationNs) {
    const milliseconds = Number(durationNs || 0) / 1_000_000;
    if (milliseconds < 1000) {
        return `${milliseconds.toFixed(0)} ms`;
    }

    const seconds = milliseconds / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(2)} s`;
    }

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${(seconds % 60).toFixed(1)}s`;
}

function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (value < 1024) {
        return `${value} B`;
    }

    const kb = value / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
}

function getFeatureName(feature, fallbackIndex) {
    if (feature?.name) {
        return String(feature.name);
    }

    const elementId = feature?.elements?.[0]?.id ?? "";
    const slug = elementId.split(";")[0];
    if (slug) {
        return titleCase(slug);
    }

    return `Feature ${fallbackIndex + 1}`;
}

function getScenarioStatus(steps) {
    const statuses = (steps ?? []).map((step) => normalizeStatus(step?.result?.status));

    if (statuses.includes("failed")) {
        return "failed";
    }
    if (statuses.includes("ambiguous")) {
        return "ambiguous";
    }
    if (statuses.includes("undefined")) {
        return "undefined";
    }
    if (statuses.includes("pending")) {
        return "pending";
    }
    if (statuses.includes("skipped")) {
        return "skipped";
    }
    if (statuses.every((status) => status === "passed")) {
        return "passed";
    }

    return "unknown";
}

function summarizeEmbeddings(embeddings, isFailedScenario) {
    return (embeddings ?? [])
        .filter((item) => {
            // Only include screenshots and videos for failed scenarios
            if (isFailedScenario) {
                return true;
            }
            // For non-failed scenarios, skip image/video attachments
            const mimeType = item?.mime_type || "";
            return !mimeType.includes("image/") && !mimeType.includes("video/");
        })
        .map((item) => {
            const mimeType = item?.mime_type || "unknown";
            const byteSize = Math.floor((String(item?.data || "").length * 3) / 4);
            return {
                mimeType,
                byteSize
            };
        });
}

function countByStatus(items, selector) {
    return items.reduce((accumulator, item) => {
        const status = normalizeStatus(selector(item));
        accumulator[status] = (accumulator[status] || 0) + 1;
        return accumulator;
    }, {});
}

function toScenarioRecords(features) {
    const records = [];

    (features ?? []).forEach((feature, featureIndex) => {
        const featureName = getFeatureName(feature, featureIndex);
        const scenarios = feature?.elements ?? [];

        scenarios.forEach((scenario, scenarioIndex) => {
            const steps = scenario?.steps ?? [];
            const status = getScenarioStatus(steps);
            const isFailedScenario = status === "failed";
            const durationNs = steps.reduce((sum, step) => sum + Number(step?.result?.duration || 0), 0);
            const failedStep = steps.find((step) => normalizeStatus(step?.result?.status) === "failed");
            const allEmbeddings = steps.flatMap((step) => summarizeEmbeddings(step?.embeddings, isFailedScenario));
            const visibleSteps = steps.filter((step) => !step?.hidden);
            const tags = (scenario?.tags ?? []).map((tag) => tag?.name).filter(Boolean);

            records.push({
                id: `${featureIndex + 1}-${scenarioIndex + 1}`,
                featureName,
                scenarioName: String(scenario?.name || `Scenario ${scenarioIndex + 1}`),
                status,
                durationNs,
                line: scenario?.line ?? "",
                tags,
                steps,
                visibleSteps,
                failedStepName: failedStep?.name || "",
                failureMessage: failedStep?.result?.error_message || "",
                embeddings: allEmbeddings
            });
        });
    });

    return records;
}

function buildHtml(records) {
    const scenarioCounts = countByStatus(records, (record) => record.status);
    const stepRecords = records.flatMap((record) => record.visibleSteps);
    const stepCounts = countByStatus(stepRecords, (step) => step?.result?.status);

    const totalScenarios = records.length;
    const passedScenarios = scenarioCounts.passed || 0;
    const failedScenarios = scenarioCounts.failed || 0;
    const totalSteps = stepRecords.length;
    const totalAttachments = records.reduce((sum, record) => sum + record.embeddings.length, 0);
    const totalDurationNs = records.reduce((sum, record) => sum + record.durationNs, 0);
    const passRate = totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(1) : "0.0";

    // Build status legend
    const statusLegend = STATUS_ORDER.filter((status) => (scenarioCounts[status] || stepCounts[status] || 0) > 0)
        .map((status) => {
            const color = STATUS_COLORS[status];
            return `<span class="legend-pill" style="background:${color.light}; border-left:4px solid ${color.bg}">${escapeHtml(titleCase(status))}</span>`;
        })
        .join("");

    // Build scenario cards
    const scenarioCards = records.map((record) => {
        const searchText = `${record.featureName} ${record.scenarioName} ${record.tags.join(" ")}`.toLowerCase();
        const tagText = record.tags.length > 0
            ? `<div class="tag-list">${record.tags.map((tag) => `<span class="tag-item">${escapeHtml(tag)}</span>`).join("")}</div>`
            : "";

        const statusColor = STATUS_COLORS[record.status];
        const duration = formatDuration(record.durationNs);

        const stepRows = record.steps.map((step) => {
            const stepStatus = normalizeStatus(step?.result?.status);
            const stepColor = STATUS_COLORS[stepStatus];
            const stepLabel = step?.hidden
                ? `Hook: ${String(step?.keyword || "Step").trim()}`
                : `${String(step?.keyword || "").trim()} ${String(step?.name || "").trim()}`.trim();
            const location = step?.match?.location || "-";
            const error = step?.result?.error_message
                ? `<tr class="error-row"><td colspan="4"><pre>${escapeHtml(step.result.error_message)}</pre></td></tr>`
                : "";

            return `
                <tr>
                    <td class="step-keyword">${escapeHtml(stepLabel)}</td>
                    <td><span class="status-badge" style="background:${stepColor.light}; color:${stepColor.bg}; border:1px solid ${stepColor.bg}">${escapeHtml(titleCase(stepStatus))}</span></td>
                    <td>${escapeHtml(step?.result?.duration ? formatDuration(step.result.duration) : "0 ms")}</td>
                    <td class="mono">${escapeHtml(location)}</td>
                </tr>
                ${error}
            `;
        }).join("");

        const attachmentBlock = record.embeddings.length > 0
            ? `
                <div class="attachments">
                    <div class="attachments-header">📎 Screenshots & Videos (Failure Artifacts)</div>
                    <ul class="attachments-list">
                        ${record.embeddings.map((attachment) => `<li><code>${escapeHtml(attachment.mimeType)}</code> ${escapeHtml(formatBytes(attachment.byteSize))}</li>`).join("")}
                    </ul>
                </div>
            `
            : "";

        const failureBlock = record.status === "failed" && record.failureMessage
            ? `
                <div class="failure-message">
                    <div class="failure-header">⚠️ Failure Details</div>
                    <pre>${escapeHtml(record.failureMessage)}</pre>
                </div>
            `
            : "";

        return `
            <details class="scenario-card" data-status="${record.status}" data-search="${searchText}">
                <summary style="border-left:5px solid ${statusColor.bg}">
                    <div class="summary-content">
                        <div>
                            <div class="scenario-title">${escapeHtml(record.scenarioName)}</div>
                            <div class="scenario-meta">${escapeHtml(record.featureName)}</div>
                            ${tagText}
                        </div>
                        <div class="summary-right">
                            <span class="status-badge" style="background:${statusColor.bg}; color:${statusColor.text}">${escapeHtml(titleCase(record.status))}</span>
                            <span class="duration-badge">${duration}</span>
                        </div>
                    </div>
                </summary>
                <div class="card-body">
                    ${failureBlock}
                    <div class="steps-section">
                        <h4>Steps</h4>
                        <table class="steps-table">
                            <thead>
                                <tr>
                                    <th>Step</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stepRows}
                            </tbody>
                        </table>
                    </div>
                    ${attachmentBlock}
                </div>
            </details>
        `;
    }).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Report</title>
    <style>
        :root {
            --primary-bg: #ffffff;
            --secondary-bg: #f7f8fc;
            --tertiary-bg: #eff1f8;
            --text-primary: #1a202c;
            --text-secondary: #4a5568;
            --text-tertiary: #718096;
            --border-light: #e2e8f0;
            --border-medium: #cbd5e1;
            --accent-pass: #06b6d4;
            --accent-fail: #f43f5e;
            --accent-skip: #a78bfa;
            --accent-pending: #f97316;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
            --shadow-lg: 0 12px 24px rgba(0,0,0,0.12);
            --gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            --gradient-dark: linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e8eef7 100%);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        /* Header */
        .header {
            background: var(--gradient-dark);
            color: white;
            padding: 60px 40px;
            border-radius: 16px;
            margin-bottom: 40px;
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -20%;
            left: -5%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        .header h1 {
            font-size: 2.8em;
            font-weight: 800;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
            letter-spacing: -1px;
        }

        .header p {
            font-size: 0.95em;
            opacity: 0.92;
            position: relative;
            z-index: 1;
        }

        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .kpi-card {
            background: white;
            padding: 24px;
            border-radius: 14px;
            box-shadow: var(--shadow-md);
            border-top: 5px solid var(--accent-pass);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        .kpi-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-lg);
        }

        .kpi-card.critical {
            border-top-color: var(--accent-fail);
        }

        .kpi-card.critical::before {
            background: radial-gradient(circle, rgba(244, 63, 94, 0.05) 0%, transparent 70%);
        }

        .kpi-card.success {
            border-top-color: var(--accent-pass);
        }

        .kpi-card.success::before {
            background: radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%);
        }

        .kpi-label {
            font-size: 0.8em;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .kpi-value {
            font-size: 2.2em;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.5px;
        }

        .kpi-value.percent {
            font-size: 3.2em;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Summary Sections */
        .summary-section {
            background: white;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: var(--shadow-md);
        }

        .summary-section h2 {
            font-size: 1.2em;
            margin-bottom: 16px;
            color: var(--text-primary);
            border-bottom: 2px solid var(--border-light);
            padding-bottom: 12px;
        }

        .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        .legend-pill {
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 0.85em;
            font-weight: 600;
            border-left: 4px solid;
            transition: all 0.2s ease;
            cursor: default;
        }

        .legend-pill:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        /* Controls */
        .controls {
            background: white;
            padding: 20px;
            border-radius: 14px;
            margin-bottom: 24px;
            box-shadow: var(--shadow-md);
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }

        #scenario-search {
            flex: 1;
            min-width: 250px;
            padding: 10px 16px;
            border: 2px solid var(--border-light);
            border-radius: 8px;
            font-size: 0.95em;
            transition: all 0.2s ease;
            background: white;
        }

        #scenario-search:focus {
            outline: none;
            border-color: var(--accent-pass);
            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }

        .filter-btn, .small-btn {
            padding: 10px 18px;
            border: 2px solid var(--border-light);
            background: white;
            color: var(--text-primary);
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.9em;
        }

        .filter-btn:hover, .small-btn:hover {
            background: var(--secondary-bg);
            border-color: var(--accent-pass);
            color: var(--accent-pass);
        }

        .filter-btn.active {
            background: var(--gradient-primary);
            color: white;
            border-color: var(--accent-pass);
            box-shadow: var(--shadow-md);
        }

        #visible-count {
            margin-left: auto;
            color: var(--text-tertiary);
            font-size: 0.9em;
            white-space: nowrap;
            font-weight: 500;
        }

        /* Scenario List */
        .scenario-list {
            display: grid;
            gap: 16px;
        }

        .scenario-card {
            background: white;
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scenario-card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
        }

        .scenario-card[open] {
            box-shadow: var(--shadow-lg);
        }

        .scenario-card summary {
            padding: 16px 24px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            transition: background 0.2s ease;
            border-left: 5px solid var(--accent-pass);
        }

        .scenario-card summary:hover {
            background: var(--secondary-bg);
        }

        .summary-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
            gap: 16px;
        }

        .scenario-title {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 1em;
            margin-bottom: 4px;
        }

        .scenario-meta {
            font-size: 0.85em;
            color: var(--text-tertiary);
        }

        .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
        }

        .tag-item {
            display: inline-block;
            background: var(--tertiary-bg);
            color: var(--text-secondary);
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.75em;
            font-weight: 500;
        }

        .summary-right {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85em;
            font-weight: 700;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
        }

        .status-badge:hover {
            transform: scale(1.05);
        }

        .duration-badge {
            padding: 6px 12px;
            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
            color: var(--accent-pass);
            border-radius: 6px;
            font-size: 0.85em;
            font-weight: 700;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.3px;
        }

        /* Card Body */
        .card-body {
            padding: 24px;
            border-top: 1px solid var(--border-light);
        }

        .failure-message {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;
            border-left: 5px solid var(--accent-fail);
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 16px;
        }

        .failure-header {
            font-weight: 700;
            color: #be123c;
            margin-bottom: 8px;
            font-size: 0.95em;
        }

        .failure-message pre {
            background: #fff5f5;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.85em;
            color: #be123c;
            white-space: pre-wrap;
            word-wrap: break-word;
            border: 1px solid #fbcfe8;
        }

        .steps-section {
            margin-bottom: 16px;
        }

        .steps-section h4 {
            font-size: 0.95em;
            margin-bottom: 12px;
            color: var(--text-primary);
            font-weight: 700;
        }

        .steps-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9em;
        }

        .steps-table thead {
            background: linear-gradient(135deg, #f0f4f8 0%, #e3f2fd 100%);
            border-bottom: 2px solid var(--accent-pass);
        }

        .steps-table th {
            padding: 12px 14px;
            text-align: left;
            font-weight: 700;
            color: #0c4a6e;
            font-size: 0.8em;
            text-transform: uppercase;
            letter-spacing: 0.7px;
        }

        .steps-table td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border-light);
            vertical-align: top;
        }

        .steps-table tbody tr:hover {
            background: var(--secondary-bg);
        }

        .step-keyword {
            color: var(--text-primary);
            font-weight: 600;
        }

        .error-row td {
            background: #fef2f2 !important;
            padding: 12px !important;
            border-left: 3px solid var(--accent-fail);
        }

        .error-row pre {
            margin: 0;
            font-size: 0.8em;
            color: #be123c;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
        }

        /* Attachments */
        .attachments {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #7dd3fc;
            border-left: 5px solid var(--accent-pass);
            border-radius: 10px;
            padding: 16px;
        }

        .attachments-header {
            font-weight: 700;
            color: #0369a1;
            margin-bottom: 12px;
            font-size: 0.95em;
        }

        .attachments-list {
            list-style: none;
            padding: 0;
        }

        .attachments-list li {
            padding: 6px 0;
            color: var(--text-secondary);
            font-size: 0.9em;
        }

        .attachments-list code {
            background: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            color: var(--accent-pass);
            border: 1px solid #cffafe;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            color: var(--text-tertiary);
            font-size: 0.85em;
            margin-top: 40px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 20px 16px;
            }

            .header {
                padding: 30px 24px;
            }

            .header h1 {
                font-size: 1.8em;
            }

            .kpi-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .summary-content {
                flex-direction: column;
                align-items: flex-start;
            }

            .summary-right {
                width: 100%;
                justify-content: flex-start;
            }

            .controls {
                flex-direction: column;
            }

            #scenario-search {
                min-width: 100%;
            }

            #visible-count {
                margin-left: 0;
            }
        }

        /* Animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .scenario-card {
            animation: fadeIn 0.4s ease;
        }

        .scenario-card:nth-child(1) { animation-delay: 0.05s; }
        .scenario-card:nth-child(2) { animation-delay: 0.1s; }
        .scenario-card:nth-child(3) { animation-delay: 0.15s; }
        .scenario-card:nth-child(n+4) { animation-delay: 0.2s; }
    </style>
</head>
<body>
    <div class="container">
        <section class="header">
            <h1>🧪 Test Execution Report</h1>
            <p>Generated ${escapeHtml(new Date().toLocaleString())}</p>
        </section>

        <section class="kpi-grid">
            <div class="kpi-card ${passRate === '100.0' ? 'success' : passRate < '50.0' ? 'critical' : ''}">
                <div class="kpi-label">Pass Rate</div>
                <div class="kpi-value percent">${passRate}%</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Total Scenarios</div>
                <div class="kpi-value">${totalScenarios}</div>
            </div>
            <div class="kpi-card success">
                <div class="kpi-label">Passed</div>
                <div class="kpi-value">${passedScenarios}</div>
            </div>
            <div class="kpi-card ${failedScenarios > 0 ? 'critical' : ''}">
                <div class="kpi-label">Failed</div>
                <div class="kpi-value">${failedScenarios}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Total Steps</div>
                <div class="kpi-value">${totalSteps}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Duration</div>
                <div class="kpi-value">${escapeHtml(formatDuration(totalDurationNs))}</div>
            </div>
        </section>

        <section class="summary-section">
            <h2>Test Status Legend</h2>
            <div class="legend">${statusLegend}</div>
        </section>

        <section class="controls">
            <input id="scenario-search" type="text" placeholder="Search scenarios by name, feature, or tags..." />
            <button class="filter-btn active" data-filter="all">All Scenarios</button>
            <button class="filter-btn" data-filter="passed">✓ Passed</button>
            <button class="filter-btn" data-filter="failed">✗ Failed</button>
            <button class="filter-btn" data-filter="skipped">⊘ Skipped</button>
            <button class="small-btn" id="expand-all">Expand All</button>
            <button class="small-btn" id="collapse-all">Collapse All</button>
            <span id="visible-count">${totalScenarios} shown</span>
        </section>

        <section id="scenario-list" class="scenario-list">
            ${scenarioCards}
        </section>

        <div class="footer">Report generated by generate-html-report.js • Source: reports/cucumber-report.json</div>
    </div>

    <script>
        (() => {
            const cards = Array.from(document.querySelectorAll(".scenario-card"));
            const searchInput = document.getElementById("scenario-search");
            const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
            const visibleCount = document.getElementById("visible-count");
            const expandAllBtn = document.getElementById("expand-all");
            const collapseAllBtn = document.getElementById("collapse-all");
            let activeFilter = "all";

            function applyFilters() {
                const term = (searchInput.value || "").toLowerCase().trim();
                let shown = 0;

                cards.forEach((card) => {
                    const status = card.dataset.status || "unknown";
                    const searchText = card.dataset.search || "";
                    const statusMatch = activeFilter === "all" || status === activeFilter;
                    const textMatch = !term || searchText.includes(term);
                    const show = statusMatch && textMatch;

                    card.style.display = show ? "" : "none";
                    if (show) {
                        shown += 1;
                    }
                });

                visibleCount.textContent = \`\${shown} shown\`;
            }

            filterButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    activeFilter = button.dataset.filter || "all";
                    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
                    applyFilters();
                });
            });

            searchInput.addEventListener("input", applyFilters);

            expandAllBtn.addEventListener("click", () => {
                cards.forEach((card) => { if (card.style.display !== "none") card.open = true; });
            });

            collapseAllBtn.addEventListener("click", () => {
                cards.forEach((card) => { card.open = false; });
            });

            applyFilters();
        })();
    </script>
</body>
</html>
`;
}

function generateHtmlReport() {
    if (!fs.existsSync(INPUT_PATH)) {
        throw new Error(`Input report not found: ${INPUT_PATH}`);
    }

    const raw = fs.readFileSync(INPUT_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const records = toScenarioRecords(parsed);
    const html = buildHtml(records);

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, html, "utf8");

    return OUTPUT_PATH;
}

if (require.main === module) {
    try {
        const output = generateHtmlReport();
        console.log(`Custom HTML report generated: ${ output }`);
    } catch (error) {
        console.error("Failed to generate HTML report.");
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

module.exports = generateHtmlReport;
