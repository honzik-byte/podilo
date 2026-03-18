import 'server-only';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(input: SendEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATIONS_FROM_EMAIL || 'Podilo <podpora@podilo.cz>';

  if (!resendApiKey) {
    console.info('[Email] RESEND_API_KEY missing, logging instead of sending', {
      to: input.to,
      subject: input.subject,
    });
    return { ok: true, mocked: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Email provider request failed.');
  }

  return response.json();
}

export function renderPromotionEmail(type: string, payload: Record<string, unknown>) {
  const listingTitle = String(payload.listingTitle || 'váš inzerát');
  const endsAt = payload.endsAt ? new Date(String(payload.endsAt)).toLocaleString('cs-CZ') : null;
  const ctaUrl = String(payload.ctaUrl || 'https://podilo.cz/my-listings');

  if (type === 'promotion_activated') {
    return `
      <h1>Zvýšení viditelnosti je aktivní</h1>
      <p>Inzerát <strong>${listingTitle}</strong> byl úspěšně zviditelněn.</p>
      ${endsAt ? `<p>Aktivní do: <strong>${endsAt}</strong></p>` : ''}
      <p><a href="${ctaUrl}">Otevřít správu inzerátů</a></p>
    `;
  }

  if (type === 'promotion_expiring') {
    return `
      <h1>Zvýšení viditelnosti brzy končí</h1>
      <p>Inzerát <strong>${listingTitle}</strong> se vrátí do standardního pořadí.</p>
      ${endsAt ? `<p>Konec propagace: <strong>${endsAt}</strong></p>` : ''}
      <p><a href="${ctaUrl}">Znovu zviditelnit inzerát</a></p>
    `;
  }

  if (type === 'promotion_expired') {
    return `
      <h1>Zvýšení viditelnosti skončilo</h1>
      <p>Inzerát <strong>${listingTitle}</strong> už nemá aktivní TOP ani zvýraznění.</p>
      <p><a href="${ctaUrl}">Doporučit znovu zviditelnění</a></p>
    `;
  }

  return `
    <h1>Aktualizace z Podilo</h1>
    <p>Pro inzerát <strong>${listingTitle}</strong> došlo k nové události.</p>
    <p><a href="${ctaUrl}">Otevřít detail</a></p>
  `;
}
