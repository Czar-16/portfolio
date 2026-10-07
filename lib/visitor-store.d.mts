export const REGISTER_VISITOR_SCRIPT: string;
export function isVisitorId(value: unknown): value is string;
export function visitorKeys(visitorId: string, now?: Date): string[];
export function registerVisitor(visitorId: string, options?: {
  env?: Record<string, string | undefined>;
  now?: Date;
  fetch?: typeof fetch;
}): Promise<number>;
