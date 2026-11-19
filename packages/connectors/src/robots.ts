/** A small robots.txt reader following RFC 9309: most specific group, longest matching path. */

interface Group { agents: string[]; rules: { allow: boolean; path: string }[] }

export function parseRobots(text: string): Group[] {
  const groups: Group[] = [];
  let current: Group | undefined;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = (rawLine.split('#')[0] as string).trim();
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (field === 'allow' || field === 'disallow') {
      lastWasAgent = false;
      if (current && value !== '') current.rules.push({ allow: field === 'allow', path: value });
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

function patternMatches(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith('$');
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const regex = body.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*');
  return new RegExp(`^${regex}${anchored ? '$' : ''}`).test(path);
}

export function isAllowedByRobots(text: string, userAgent: string, path: string): boolean {
  const groups = parseRobots(text);
  const agent = userAgent.toLowerCase();
  const named = groups.filter((group) => group.agents.some((a) => a !== '*' && agent.includes(a)));
  const applicable = named.length > 0 ? named : groups.filter((group) => group.agents.includes('*'));
  let best: { allow: boolean; length: number } | undefined;
  for (const rule of applicable.flatMap((group) => group.rules)) {
    if (!patternMatches(rule.path, path)) continue;
    const length = rule.path.length;
    // The longest match wins. On a tie, allow wins.
    if (!best || length > best.length || (length === best.length && rule.allow)) best = { allow: rule.allow, length };
  }
  return best ? best.allow : true;
}
