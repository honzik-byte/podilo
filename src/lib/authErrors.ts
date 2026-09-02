/**
 * Supabase returns auth errors in English. Map the ones users actually hit to
 * Czech, and fall back to a generic sentence rather than showing raw API text.
 */
const AUTH_ERROR_TRANSLATIONS: Array<{ match: RegExp; message: string }> = [
  {
    match: /invalid login credentials/i,
    message: 'Nesprávný e-mail nebo heslo.',
  },
  {
    match: /email not confirmed/i,
    message: 'Účet zatím není potvrzený. Otevřete odkaz v e-mailu, který jsme vám poslali.',
  },
  {
    match: /user already registered|already been registered/i,
    message: 'Na tento e-mail už účet existuje. Zkuste se přihlásit.',
  },
  {
    match: /password should be at least (\d+)/i,
    message: 'Heslo musí mít alespoň 6 znaků.',
  },
  {
    match: /unable to validate email address|invalid format/i,
    message: 'Zadejte e-mail v platném formátu.',
  },
  {
    match: /email rate limit exceeded|over_email_send_rate_limit/i,
    message: 'Odeslali jsme příliš mnoho e-mailů za sebou. Zkuste to prosím za chvíli znovu.',
  },
  {
    match: /you can only request this after (\d+) seconds/i,
    message: 'Chvíli počkejte, než to zkusíte znovu.',
  },
  {
    match: /signup(s)? (is |are )?(not allowed|disabled)/i,
    message: 'Registrace je momentálně pozastavená.',
  },
  {
    match: /failed to fetch|network/i,
    message: 'Nepodařilo se spojit se serverem. Zkontrolujte připojení a zkuste to znovu.',
  },
];

export function translateAuthError(rawMessage: string) {
  const hit = AUTH_ERROR_TRANSLATIONS.find((entry) => entry.match.test(rawMessage));

  if (hit) {
    return hit.message;
  }

  console.error('[podilo] Nepřeložená chyba přihlášení:', rawMessage);
  return 'Něco se nepovedlo. Zkuste to prosím znovu, nebo napište na podpora@podilo.cz.';
}
