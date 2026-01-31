/**
 * Theme initialization script component.
 * This script runs before React hydration to prevent flash of wrong theme.
 * The script content is a static constant string that we fully control,
 * not user-provided content, making this usage safe from XSS vulnerabilities.
 */
export function ThemeScript() {
  // Static theme initialization script - no user input, safe to inline
  const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

  return (
    <script
      // Safe: content is a compile-time constant, not user input
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
