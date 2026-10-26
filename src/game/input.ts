export const keyboardAxes = { forward: 0, strafe: 0 };
export const touchAxes = { forward: 0, strafe: 0, active: false };
export const inputState = { jumpQueued: false };

const held = new Set<string>();

function syncKeyboardAxes() {
  const forward =
    (held.has('w') || held.has('arrowup') ? 1 : 0) - (held.has('s') || held.has('arrowdown') ? 1 : 0);
  const strafe =
    (held.has('d') || held.has('arrowright') ? 1 : 0) - (held.has('a') || held.has('arrowleft') ? 1 : 0);
  keyboardAxes.forward = forward;
  keyboardAxes.strafe = strafe;
}

export function setHeld(key: string, down: boolean) {
  if (down) held.add(key);
  else held.delete(key);
  syncKeyboardAxes();
}

export function clearHeld() {
  held.clear();
  syncKeyboardAxes();
  touchAxes.active = false;
  touchAxes.forward = 0;
  touchAxes.strafe = 0;
  inputState.jumpQueued = false;
}

export function readAxes() {
  if (touchAxes.active) return { forward: touchAxes.forward, strafe: touchAxes.strafe };
  const forward = keyboardAxes.forward;
  const strafe = keyboardAxes.strafe;
  const magnitude = Math.hypot(forward, strafe);
  if (magnitude > 1) return { forward: forward / magnitude, strafe: strafe / magnitude };
  return { forward, strafe };
}
