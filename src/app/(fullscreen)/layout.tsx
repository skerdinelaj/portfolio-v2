/**
 * Shell for one-screen pages (/about, /experience, /tech, /contact): no Footer and no scroll progress bar, and <main> fills the space
 * under the site header (which comes from the root layout). The group folder name doesn't appear in the URL.
 */
export default function FullscreenLayout({ children }: LayoutProps<"/">) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
