/**
 * The slot's match for the home page (/). The catch-all next to it only matches paths with at least one segment,
 * so without this, closing the popup back to / would keep the slot's last state and the popup would stay open.
 */
export default function HomeSlot() {
  return null;
}
