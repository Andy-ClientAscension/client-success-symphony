// Semantic HTML improvements
export const semanticComponents = {
  // Main content wrapper
  MainContent: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <main role="main" {...props}>
      {children}
    </main>
  ),

  // Navigation wrapper
  Navigation: ({ children, label, ...props }: React.HTMLAttributes<HTMLElement> & { label?: string }) => (
    <nav role="navigation" aria-label={label || "Main navigation"} {...props}>
      {children}
    </nav>
  ),

  // Section wrapper
  Section: ({ children, title, ...props }: React.HTMLAttributes<HTMLElement> & { title?: string }) => (
    <section role="region" aria-label={title} {...props}>
      {children}
    </section>
  ),

  // Article wrapper
  Article: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <article role="article" {...props}>
      {children}
    </article>
  ),

  // Aside wrapper
  Aside: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <aside role="complementary" {...props}>
      {children}
    </aside>
  ),

  // Header wrapper
  Header: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <header role="banner" {...props}>
      {children}
    </header>
  ),

  // Footer wrapper
  Footer: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <footer role="contentinfo" {...props}>
      {children}
    </footer>
  )
};

// ARIA helpers
export const ariaHelpers = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string = 'element') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Common ARIA patterns
  listBox: {
    container: { role: 'listbox' },
    option: { role: 'option' }
  },
  
  dialog: {
    container: { role: 'dialog', 'aria-modal': true },
    title: { role: 'heading', 'aria-level': 2 }
  },
  
  tab: {
    container: { role: 'tablist' },
    tab: { role: 'tab' },
    panel: { role: 'tabpanel' }
  }
};