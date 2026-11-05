/**
 * Navigating anywhere else while the popup is open: the slot matches this and renders nothing, so the popup closes.
 * (Without it, a client-side navigation keeps the slot's last state and the popup would stay open.)
 */
export default function CatchAll() {
  return null;
}
