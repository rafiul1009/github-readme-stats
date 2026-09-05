/**
 * Thrown by a widget's fetchRawData/computeData to report a user-facing
 * problem (bad input, not found, upstream failure) with an explicit status
 * code — as opposed to an unexpected exception, which the handler reports
 * as a generic "failed to render" (docs/TODOS.md 3.6).
 */
export class WidgetRenderError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "WidgetRenderError";
  }
}
