export function responseJson(body: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}

export function isSameOriginJson(request: Request) {
  const origin = request.headers.get("Origin");
  const type = request.headers.get("Content-Type")?.split(";")[0].toLowerCase();
  const site = request.headers.get("Sec-Fetch-Site");
  return type === "application/json" && (!origin || origin === new URL(request.url).origin)
    && site !== "cross-site" && site !== "same-site";
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const buffer = new Uint8Array(4096);
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.length > buffer.length) {
        await reader.cancel();
        return null;
      }
      buffer.set(value, size);
      size += value.length;
    }
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, size)));
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}
