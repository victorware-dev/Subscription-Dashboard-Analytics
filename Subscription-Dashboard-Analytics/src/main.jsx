import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const initialSubscriptions = [
  {
    id: 1,
    name: "Netflix",
    category: "Entertainment",
    monthlyCost: 649,
    active: true,
    renewalDate: "2026-08-02",
    owner: "Family",
  },
  {
    id: 2,
    name: "Spotify",
    category: "Music",
    monthlyCost: 119,
    active: true,
    renewalDate: "2026-07-29",
    owner: "Personal",
  },
  {
    id: 3,
    name: "ChatGPT Plus",
    category: "AI",
    monthlyCost: 1700,
    active: true,
    renewalDate: "2026-08-12",
    owner: "Work",
  },
  {
    id: 4,
    name: "AWS Sandbox",
    category: "Cloud",
    monthlyCost: 1500,
    active: false,
    renewalDate: "Paused",
    owner: "Work",
  },
  {
    id: 5,
    name: "Adobe Creative Cloud",
    category: "Design",
    monthlyCost: 900,
    active: false,
    renewalDate: "Paused",
    owner: "Creative",
  },
];

const planBank = [
  ["Notion AI", "Productivity", 850],
  ["Canva Pro", "Design", 499],
  ["Figma", "Design", 1200],
  ["GitHub Copilot", "AI", 830],
  ["Google One", "Storage", 130],
  ["Prime Video", "Entertainment", 299],
];

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "expensive", label: "Over Rs 1,000" },
  { id: "paused", label: "Paused" },
];

function formatCurrency(value) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function App() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const metrics = useMemo(() => {
    const activePlans = subscriptions.filter((subscription) => subscription.active);
    const monthlySpend = activePlans.reduce((sum, subscription) => sum + subscription.monthlyCost, 0);
    const yearlySpend = monthlySpend * 12;
    const potentialSavings = subscriptions
      .filter((subscription) => !subscription.active)
      .reduce((sum, subscription) => sum + subscription.monthlyCost, 0) * 12;
    const averageCost = activePlans.length ? Math.round(monthlySpend / activePlans.length) : 0;

    return {
      activeCount: activePlans.length,
      monthlySpend,
      yearlySpend,
      potentialSavings,
      averageCost,
    };
  }, [subscriptions]);

  const categoryTotals = useMemo(() => {
    return subscriptions.reduce((totals, subscription) => {
      const current = totals[subscription.category] || 0;
      return {
        ...totals,
        [subscription.category]: current + (subscription.active ? subscription.monthlyCost : 0),
      };
    }, {});
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesSearch =
        subscription.name.toLowerCase().includes(normalizedQuery) ||
        subscription.category.toLowerCase().includes(normalizedQuery) ||
        subscription.owner.toLowerCase().includes(normalizedQuery);

      if (!matchesSearch) return false;
      if (activeFilter === "active") return subscription.active;
      if (activeFilter === "paused") return !subscription.active;
      if (activeFilter === "expensive") return subscription.monthlyCost > 1000;
      return true;
    });
  }, [activeFilter, query, subscriptions]);

  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  function addSubscription() {
    const [name, category, monthlyCost] = planBank[Math.floor(Math.random() * planBank.length)];
    const nextPlan = {
      id: Date.now(),
      name,
      category,
      monthlyCost,
      active: Math.random() > 0.25,
      renewalDate: "2026-08-18",
      owner: Math.random() > 0.5 ? "Work" : "Personal",
    };

    setSubscriptions((current) => [nextPlan, ...current]);
  }

  function toggleSubscription(id) {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === id ? { ...subscription, active: !subscription.active } : subscription,
      ),
    );
  }

  function removeSubscription(id) {
    setSubscriptions((current) => current.filter((subscription) => subscription.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Subscription intelligence</p>
          <h1>SubTrack AI</h1>
          <p className="hero-copy">
            Track recurring costs, spot expensive plans, and decide what to keep before the next billing cycle.
          </p>
        </div>
        <div className="hero-panel" aria-label="Spend summary">
          <span>This month</span>
          <strong>{formatCurrency(metrics.monthlySpend)}</strong>
          <small>{metrics.activeCount} active plans monitored</small>
        </div>
      </section>

      <section className="toolbar" aria-label="Subscription filters">
        <label className="search-field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, category, or owner"
          />
        </label>

        <div className="filter-tabs">
          {filters.map((filter) => (
            <button
              className={activeFilter === filter.id ? "tab active-tab" : "tab"}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <button className="primary-action" onClick={addSubscription} type="button">
          Add Plan
        </button>
      </section>

      <section className="metrics-grid" aria-label="Dashboard analytics">
        <MetricCard label="Monthly Spend" value={formatCurrency(metrics.monthlySpend)} tone="blue" />
        <MetricCard label="Yearly Spend" value={formatCurrency(metrics.yearlySpend)} tone="green" />
        <MetricCard label="Paused Savings" value={formatCurrency(metrics.potentialSavings)} tone="amber" />
        <MetricCard label="Avg Active Plan" value={formatCurrency(metrics.averageCost)} tone="rose" />
      </section>

      <section className="dashboard-grid">
        <div className="insights-panel">
          <div className="section-heading">
            <p className="eyebrow">Insights</p>
            <h2>Category spend</h2>
          </div>

          <div className="category-list">
            {Object.entries(categoryTotals).map(([category, total]) => {
              const width = metrics.monthlySpend ? Math.max((total / metrics.monthlySpend) * 100, 8) : 8;
              return (
                <div className="category-row" key={category}>
                  <div>
                    <strong>{category}</strong>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="recommendation">
            <span>Focus area</span>
            <strong>{highestCategory ? highestCategory[0] : "No active spend"}</strong>
            <p>
              Review the largest active category first. Small plan decisions compound quickly across the year.
            </p>
          </div>
        </div>

        <div className="subscriptions-area">
          <div className="section-heading">
            <p className="eyebrow">Plans</p>
            <h2>{filteredSubscriptions.length} subscriptions</h2>
          </div>

          <div className="subscription-grid">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onRemove={removeSubscription}
                onToggle={toggleSubscription}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SubscriptionCard({ subscription, onRemove, onToggle }) {
  return (
    <article className="subscription-card">
      <div className="card-topline">
        <span className={subscription.active ? "status active" : "status paused"}>
          {subscription.active ? "Active" : "Paused"}
        </span>
        <span>{subscription.owner}</span>
      </div>

      <h3>{subscription.name}</h3>
      <p>{subscription.category}</p>

      <div className="plan-meta">
        <div>
          <span>Monthly</span>
          <strong>{formatCurrency(subscription.monthlyCost)}</strong>
        </div>
        <div>
          <span>Renewal</span>
          <strong>{subscription.renewalDate}</strong>
        </div>
      </div>

      <div className="card-actions">
        <button onClick={() => onToggle(subscription.id)} type="button">
          {subscription.active ? "Pause" : "Activate"}
        </button>
        <button className="ghost-danger" onClick={() => onRemove(subscription.id)} type="button">
          Remove
        </button>
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
