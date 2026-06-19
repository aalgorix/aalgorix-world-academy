import {
  createSmtpTransporter,
  escapeHtml,
  getContactInquiryRecipient,
} from "@/lib/email/smtp";

export const runtime = "nodejs";

const HELP_TOPIC_LABELS: Readonly<Record<string, string>> = {
  admissions: "Admissions & enrollment",
  "general-enquiry": "General enquiry",
  curriculum: "Curriculum & academic pathways",
  "fees-billing": "Fees & tuition enquiry",
  "technical-support": "Technical & platform support",
  partnerships: "Partnerships & media",
  other: "Something else",
};

function helpTopicLabel(value: string) {
  return HELP_TOPIC_LABELS[value] ?? value;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{
      guardianName: string;
      email: string;
      phone: string;
      helpTopic: string;
      learningNotes: string;
    }>;

    const guardianName = (body.guardianName ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const helpTopic = (body.helpTopic ?? "").trim();
    const learningNotes = (body.learningNotes ?? "").trim();

    if (!guardianName || !email || !phone || !helpTopic) {
      return Response.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }

    if (!HELP_TOPIC_LABELS[helpTopic]) {
      return Response.json({ success: false, error: "Invalid help topic." }, { status: 400 });
    }

    const topicLabel = helpTopicLabel(helpTopic) ?? "";
    const submittedAt = new Date().toISOString();
    const { transporter, fromAddress } = createSmtpTransporter();
    const inquiryRecipient = getContactInquiryRecipient();

    const messageBlock = learningNotes.length
      ? `<p style="margin: 0; white-space: pre-wrap;">${escapeHtml(learningNotes)}</p>`
      : `<p style="margin: 0; color: #64748b; font-style: italic;">No message provided.</p>`;

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">New contact inquiry — Aalgorix World Academy</h2>
        <p style="margin: 0 0 16px; color: #475569;">Submitted at ${escapeHtml(submittedAt)}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 700; width: 160px;">Name</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${escapeHtml(guardianName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 700;">Email</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 700;">Phone</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${escapeHtml(phone)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 700;">Topic</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${escapeHtml(topicLabel)}</td>
            </tr>
          </tbody>
        </table>
        <div style="padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
          <p style="margin: 0 0 8px; font-weight: 700;">Message</p>
          ${messageBlock}
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Aalgorix World Academy" <${fromAddress}>`,
      to: inquiryRecipient,
      replyTo: `"${guardianName.replaceAll('"', "")}" <${email}>`,
      subject: `Contact inquiry: ${topicLabel} — ${guardianName}`,
      html,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
