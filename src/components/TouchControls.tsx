import { useRef } from 'react';
import { inputState, touchAxes } from '../game/input.ts';

export function TouchControls() {
  const knob = useRef<HTMLSpanElement>(null);
  const origin = useRef({ x: 0, y: 0 });

  const moveKnob = (clientX: number, clientY: number) => {
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const max = 46;
    const magnitude = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(magnitude, max);
    const x = (dx / magnitude) * clamped;
    const y = (dy / magnitude) * clamped;
    if (knob.current) knob.current.style.transform = `translate(${x}px, ${y}px)`;
    touchAxes.active = true;
    touchAxes.strafe = x / max;
    touchAxes.forward = -y / max;
  };

  const endDrag = () => {
    touchAxes.active = false;
    touchAxes.forward = 0;
    touchAxes.strafe = 0;
    if (knob.current) knob.current.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div className="touch-controls">
      <div
        className="joystick"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          origin.current = { x: event.clientX, y: event.clientY };
          moveKnob(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (!touchAxes.active) return;
          moveKnob(event.clientX, event.clientY);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span ref={knob} className="joystick-knob" />
      </div>
      <button
        type="button"
        className="jump-pad"
        onPointerDown={(event) => {
          event.preventDefault();
          inputState.jumpQueued = true;
        }}
      >
        Jump
      </button>
    </div>
  );
}
