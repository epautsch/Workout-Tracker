const tabs = ['Dashboard', 'Exercises', 'Session', 'History', 'Progress', 'Export'] as const;
export type TabName = (typeof tabs)[number];

export const BottomNav = ({ active, onChange }: { active: TabName; onChange: (tab: TabName) => void }) => (
  <nav className="bottom-nav">
    {tabs.map((tab) => (
      <button key={tab} className={active === tab ? 'active' : ''} onClick={() => onChange(tab)}>
        {tab}
      </button>
    ))}
  </nav>
);
