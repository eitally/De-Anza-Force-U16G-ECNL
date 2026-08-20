import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# 1. Add Moon, Sun to imports
content = content.replace("Share2", "Share2,\n  Moon,\n  Sun")

# 2. Add isDarkTheme state and useEffect
state_hook = """  const [showToast, setShowToast] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // default dark
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

"""
content = content.replace("  const [showToast, setShowToast] = useState(false);", state_hook)

# 3. Add the toggle button
toggle_btn = """          {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/80 transition-all shadow-sm group"
              title="Toggle Light/Dark Mode"
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 group-hover:text-blue-500 transition-colors" />
              )}
            </button>

            {/* Share Page Link */}"""

content = content.replace("{/* Share Page Link */}", toggle_btn)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
