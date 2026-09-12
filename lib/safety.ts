/**
 * Client-side safety screen. Mirrors the server screen in the coach functions so
 * the app can route to crisis resources before any text is sent anywhere.
 * Deliberately errs toward showing support resources.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/i,
  /\bkill (myself|my self)\b/i,
  /\bend (my life|it all)\b/i,
  /\btake my own life\b/i,
  /\b(want|going) to die\b/i,
  /\bbetter off dead\b/i,
  /\bno reason to live\b/i,
  /\bself[-\s]?harm\b/i,
  /\b(cut|cutting|burn|burning|hurt|hurting)\s+myself\b/i,
  /\boverdose\b/i,
  /\bkill (him|her|them|someone|everyone)\b/i,
  /\bhurt (someone|somebody|my kids|my children)\b/i,
  /\bstarv(e|ing) myself\b/i,
  /\bmake myself (throw up|vomit|sick)\b/i,
  /\bpurging\b/i,
  /\bhearing voices\b/i,
  /\bhallucinat/i,
  /\b(he|she|they|my partner|my husband|my wife|my boss)\s+(hits|hit|beats|beat|chokes|choked|threatens|threatened)\s+me\b/i,
  /\b(physically|sexually|emotionally)\s+abus/i,
  /\bdomestic (violence|abuse)\b/i,
  /\bcan'?t breathe\b/i,
  /\bchest pain\b/i,
];

export function containsCrisisLanguage(text: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}
