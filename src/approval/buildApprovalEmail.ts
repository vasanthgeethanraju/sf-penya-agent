import type { ApprovalPackage } from "./approvalTypes";

export function buildApprovalEmail(
  approvalPackage: ApprovalPackage
) {
  const baseUrl =
    process.env.APPROVAL_BASE_URL ??
    "http://localhost:3000";

  const approveUrl =
    `${baseUrl}/approve/${approvalPackage.id}`;

  const rejectUrl =
    `${baseUrl}/reject/${approvalPackage.id}`;

  const subject =
    `Approval needed: Barça vs ${approvalPackage.match.opponent}`;

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">

    <h2>SF Penya Match Package Ready</h2>

    <h3>Match</h3>
    <p>
      <strong>Barça vs ${approvalPackage.match.opponent}</strong><br>
      ${approvalPackage.match.day}, ${approvalPackage.match.date}<br>
      Kickoff: ${approvalPackage.match.kickoffTime}<br>
      Watch venue: ${approvalPackage.match.watchVenue}
    </p>

    ${
      approvalPackage.posterPath
        ? `
        <h3>Poster</h3>
        <img
          src="cid:match-poster"
          alt="Match-day poster"
          style="max-width: 500px; width: 100%; border-radius: 8px;"
        >
        `
        : ""
    }

    <h3>WhatsApp</h3>
    <p>${approvalPackage.content.whatsapp}</p>

    <h3>Instagram</h3>
    <p>${approvalPackage.content.instagram}</p>

    <h3>Email subject</h3>
    <p>${approvalPackage.content.emailSubject}</p>

    <h3>Email body</h3>
    <p style="white-space: pre-line;">
      ${approvalPackage.content.emailBody}
    </p>

    <div style="margin-top: 32px;">
      <a
        href="${approveUrl}"
        style="
          background-color: #1a7f37;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
          margin-right: 12px;
        "
      >
        APPROVE
      </a>

      <a
        href="${rejectUrl}"
        style="
          background-color: #d1242f;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
        "
      >
        REJECT
      </a>
    </div>

  </body>
</html>
`.trim();

  return {
    subject,
    html,
    approveUrl,
    rejectUrl,
  };
}