// Numbers and styles used by more than one file, so the same value is never typed twice.
// Values used by a single component stay in that component, next to the code that uses them.

// --- Round control buttons (menu, lens, flash, eye and freeze) ---

export const CONTROL_SIZE = 50;
export const CONTROL_BACKGROUND = 'rgba(82, 82, 82, 0.37)';

// The look shared by every round button. Each button adds only its own position.
export const controlButtonStyle = {
  width: CONTROL_SIZE,
  height: CONTROL_SIZE,
  borderRadius: CONTROL_SIZE / 2,
  backgroundColor: CONTROL_BACKGROUND,
  justifyContent: 'center',
  alignItems: 'center',
};

// --- Top row of buttons: menu and lens on the left, flash and eye on the right ---

export const TOP_ROW_TOP = 40;
export const SCREEN_MARGIN = 20;
export const LENS_BUTTON_LEFT = 80;
export const FLASH_BUTTON_RIGHT = 82;

// Smallest gap that may remain between the lens button and the flash button.
const TOP_ROW_MIN_GAP = 12;

// The flash button is hidden on screens narrower than this, because it would land on
// top of the lens button. The number is worked out from the positions above, so moving
// a button updates it automatically.
export const FLASH_MIN_WIDTH =
  LENS_BUTTON_LEFT + CONTROL_SIZE + TOP_ROW_MIN_GAP + FLASH_BUTTON_RIGHT + CONTROL_SIZE;

// --- Camera and sliders ---

// Digital zoom above this level lowers the image quality too much.
export const MAX_ZOOM = 4;

// Sliders send a new value to the camera or the screen at most this often while dragging.
export const SLIDER_UPDATE_INTERVAL_MS = 150;

// Short wait that lets the camera finish restarting before the previous zoom is applied again.
export const ZOOM_RESTORE_DELAY_MS = 100;

// How long the "Retrying…" message stays before the camera is checked again.
export const RETRY_FEEDBACK_MS = 600;

// How long an interruption (a call, for example) may last before it is reported as an error.
export const INTERRUPTION_GRACE_MS = 1500;