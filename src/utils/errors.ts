/**
 * Fire-and-forget async calls (button handlers, etc.) normally swallow
 * rejections silently — the button just looks "stuck" with no feedback.
 * Route them through this instead of a bare `void` so failures surface.
 */
export function catchErrors(promise: Promise<unknown>): void {
  promise.catch((error: unknown) => {
    console.error(error);
    window.alert(
      "Não foi possível concluir a ação. Se isso continuar acontecendo, tente recarregar o app.",
    );
  });
}
