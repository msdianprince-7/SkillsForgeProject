import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";

// ── Types ──────────────────────────────────────
interface Resource {
  _id?: string;
  title: string;
  url: string;
  type: "youtube" | "linkedin" | "documentation" | "github" | "article" | "other";
}

interface Milestone {
  _id?: string;
  title: string;
  completed: boolean;
}

interface Skill {
  _id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  category: string;
  tags: string[];
  targetDate: string | null;
  milestones: Milestone[];
  resources: Resource[];
  createdBy: { _id: string; name: string; email: string } | string;
  createdAt: string;
}

interface SkillResponse {
  total: number;
  page: number;
  pages: number;
  data: Skill[];
}

interface Stats {
  totalSkills: number;
  averageProgress: number;
  byLevel: { Beginner: number; Intermediate: number; Advanced: number };
  byCategory: { name: string; count: number }[];
  recentSkills: { title: string; level: string; progress: number; createdAt: string }[];
  upcomingDeadlines: { title: string; targetDate: string; progress: number; level: string }[];
  milestones: { total: number; completed: number };
}

type Level = "Beginner" | "Intermediate" | "Advanced";
type ResourceType = Resource["type"];
type Tab = "skills" | "analytics";

// ── Config Maps ────────────────────────────────
const levelConfig: Record<Level, { bg: string; text: string; dot: string; bar: string }> = {
  Beginner: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", bar: "bg-emerald-400" },
  Intermediate: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", bar: "bg-amber-400" },
  Advanced: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400", bar: "bg-rose-400" },
};

const resourceTypeConfig: Record<ResourceType, { icon: string; color: string; label: string }> = {
  youtube: { icon: "▶", color: "text-red-400", label: "YouTube" },
  linkedin: { icon: "in", color: "text-blue-400", label: "LinkedIn" },
  documentation: { icon: "📄", color: "text-amber-400", label: "Docs" },
  github: { icon: "⚡", color: "text-purple-400", label: "GitHub" },
  article: { icon: "📰", color: "text-teal-400", label: "Article" },
  other: { icon: "🔗", color: "text-surface-200", label: "Link" },
};

const CATEGORIES = ["General", "Frontend", "Backend", "DevOps", "Mobile", "Data Science", "Design", "Soft Skills", "Other"];

// ── Resource Links Editor ──────────────────────
const ResourceLinksEditor = ({ resources, onChange }: { resources: Resource[]; onChange: (r: Resource[]) => void }) => {
  const [t, setT] = useState("");
  const [u, setU] = useState("");
  const [tp, setTp] = useState<ResourceType>("other");
  const add = () => {
    if (!t.trim() || !u.trim()) return;
    const url = u.trim().startsWith("http") ? u.trim() : `https://${u.trim()}`;
    onChange([...resources, { title: t.trim(), url, type: tp }]);
    setT(""); setU(""); setTp("other");
  };
  return (
    <div>
      <label className="block text-xs font-medium text-surface-200/60 mb-2">Resource Links ({resources.length})</label>
      {resources.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {resources.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-800/40 border border-white/5 group text-xs">
              <span className={resourceTypeConfig[r.type].color}>{resourceTypeConfig[r.type].icon}</span>
              <span className="text-white truncate flex-1">{r.title}</span>
              <button type="button" onClick={() => onChange(resources.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity cursor-pointer">✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-1.5">
        <input placeholder="Title" value={t} onChange={(e) => setT(e.target.value)} className="px-2.5 py-1.5 rounded-lg bg-surface-800/60 border border-white/10 text-white text-xs placeholder:text-surface-200/40 focus:border-primary-400/50 transition-all" />
        <input placeholder="https://..." value={u} onChange={(e) => setU(e.target.value)} className="px-2.5 py-1.5 rounded-lg bg-surface-800/60 border border-white/10 text-white text-xs placeholder:text-surface-200/40 focus:border-primary-400/50 transition-all" />
        <select value={tp} onChange={(e) => setTp(e.target.value as ResourceType)} className="px-2 py-1.5 rounded-lg bg-surface-800/60 border border-white/10 text-surface-200 text-xs cursor-pointer">
          <option value="youtube">YouTube</option><option value="linkedin">LinkedIn</option><option value="documentation">Docs</option><option value="github">GitHub</option><option value="article">Article</option><option value="other">Other</option>
        </select>
        <button type="button" onClick={add} disabled={!t.trim() || !u.trim()} className="px-2.5 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium disabled:opacity-30 cursor-pointer">+</button>
      </div>
    </div>
  );
};

// ── Milestone Editor ───────────────────────────
const MilestoneEditor = ({ milestones, onChange }: { milestones: Milestone[]; onChange: (m: Milestone[]) => void }) => {
  const [input, setInput] = useState("");
  const add = () => {
    if (!input.trim()) return;
    onChange([...milestones, { title: input.trim(), completed: false }]);
    setInput("");
  };
  const toggle = (i: number) => onChange(milestones.map((m, j) => j === i ? { ...m, completed: !m.completed } : m));
  const remove = (i: number) => onChange(milestones.filter((_, j) => j !== i));
  return (
    <div>
      <label className="block text-xs font-medium text-surface-200/60 mb-2">Milestones ({milestones.filter(m => m.completed).length}/{milestones.length})</label>
      {milestones.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-800/40 border border-white/5 group">
              <button type="button" onClick={() => toggle(i)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${m.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20 hover:border-white/40"}`}>
                {m.completed && <span className="text-[10px] text-white">✓</span>}
              </button>
              <span className={`text-xs flex-1 ${m.completed ? "line-through text-surface-200/40" : "text-white"}`}>{m.title}</span>
              <button type="button" onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-rose-400 text-xs transition-opacity cursor-pointer">✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input placeholder="Add milestone..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-800/60 border border-white/10 text-white text-xs placeholder:text-surface-200/40 focus:border-primary-400/50 transition-all" />
        <button type="button" onClick={add} disabled={!input.trim()} className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium disabled:opacity-30 cursor-pointer">+</button>
      </div>
    </div>
  );
};

// ── Tags Editor ────────────────────────────────
const TagsEditor = ({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const tag = input.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  };
  return (
    <div>
      <label className="block text-xs font-medium text-surface-200/60 mb-2">Tags</label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 text-xs">
              #{tag}
              <button type="button" onClick={() => onChange(tags.filter((_, j) => j !== i))} className="text-primary-400/60 hover:text-rose-400 cursor-pointer">✕</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input placeholder="Add tag..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-800/60 border border-white/10 text-white text-xs placeholder:text-surface-200/40 focus:border-primary-400/50 transition-all" />
        <button type="button" onClick={add} disabled={!input.trim()} className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium disabled:opacity-30 cursor-pointer">+</button>
      </div>
    </div>
  );
};

// ── Analytics Tab ──────────────────────────────
const Analytics = ({ stats }: { stats: Stats | null }) => {
  if (!stats) return <div className="flex items-center justify-center py-20"><svg className="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

  const levelData = [
    { label: "Beginner", count: stats.byLevel.Beginner, color: "bg-emerald-400" },
    { label: "Intermediate", count: stats.byLevel.Intermediate, color: "bg-amber-400" },
    { label: "Advanced", count: stats.byLevel.Advanced, color: "bg-rose-400" },
  ];
  const maxLevel = Math.max(...levelData.map(l => l.count), 1);
  const maxCategory = Math.max(...(stats.byCategory.map(c => c.count) || [1]), 1);
  const milestonePercent = stats.milestones.total > 0 ? Math.round((stats.milestones.completed / stats.milestones.total) * 100) : 0;

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Skills", value: stats.totalSkills, icon: "🎯", accent: "from-primary-500/20 to-primary-600/5" },
          { label: "Avg Progress", value: `${stats.averageProgress}%`, icon: "📈", accent: "from-emerald-500/20 to-emerald-600/5" },
          { label: "Milestones Done", value: `${stats.milestones.completed}/${stats.milestones.total}`, icon: "✅", accent: "from-amber-500/20 to-amber-600/5" },
          { label: "Milestone Rate", value: `${milestonePercent}%`, icon: "🏆", accent: "from-rose-500/20 to-rose-600/5" },
        ].map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${card.accent} border border-white/5 rounded-2xl p-5`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
            <p className="text-xs text-surface-200/50 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills by Level */}
        <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Skills by Level</h3>
          <div className="space-y-3">
            {levelData.map((l) => (
              <div key={l.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-200/60">{l.label}</span>
                  <span className="text-white font-medium">{l.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-800/60 overflow-hidden">
                  <div className={`h-full rounded-full ${l.color} transition-all duration-700`} style={{ width: `${(l.count / maxLevel) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills by Category */}
        <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Skills by Category</h3>
          {stats.byCategory.length === 0 ? (
            <p className="text-surface-200/40 text-sm">No categories yet</p>
          ) : (
            <div className="space-y-3">
              {stats.byCategory.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-200/60">{c.name}</span>
                    <span className="text-white font-medium">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-800/60 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-400 transition-all duration-700" style={{ width: `${(c.count / maxCategory) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Average Progress */}
        <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Overall Progress</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-800/60" />
                <circle cx="64" cy="64" r="56" fill="none" stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(stats.averageProgress / 100) * 352} 352`} className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="oklch(0.55 0.20 250)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.20 160)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{stats.averageProgress}%</span>
                <span className="text-[10px] text-surface-200/50">avg progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-surface-900/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Upcoming Deadlines</h3>
          {stats.upcomingDeadlines.length === 0 ? (
            <p className="text-surface-200/40 text-sm">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingDeadlines.map((d, i) => {
                const days = daysUntil(d.targetDate);
                const urgent = days <= 7;
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-800/40 border border-white/5">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${urgent ? "bg-rose-500/20 text-rose-400" : "bg-primary-500/20 text-primary-400"}`}>
                      {days}d
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{d.title}</p>
                      <p className="text-[10px] text-surface-200/40">{d.progress}% complete</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("skills");

  // Skills list state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<Level>("Beginner");
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search, filter, pagination
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  // Edit modal
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLevel, setEditLevel] = useState<Level>("Beginner");
  const [editProgress, setEditProgress] = useState(0);
  const [editCategory, setEditCategory] = useState("General");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editMilestones, setEditMilestones] = useState<Milestone[]>([]);
  const [editResources, setEditResources] = useState<Resource[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Expanded
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Analytics
  const [stats, setStats] = useState<Stats | null>(null);

  // ── Fetch ────────────────────────────────
  const fetchSkills = useCallback(async () => {
    try {
      setFetching(true);
      const params: Record<string, string | number> = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (filterLevel) params.level = filterLevel;
      if (filterCategory) params.category = filterCategory;
      const res = await API.get<SkillResponse>("/skills", { params });
      setSkills(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  }, [page, search, filterLevel, filterCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get<Stats>("/skills/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { void fetchSkills(); }, [fetchSkills]);
  useEffect(() => { if (activeTab === "analytics") void fetchStats(); }, [activeTab, fetchStats]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Handlers ─────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError("Title and description are required."); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      await API.post("/skills", { title, description, level, progress, category, tags, targetDate: targetDate || null, milestones, resources });
      setTitle(""); setDescription(""); setLevel("Beginner"); setProgress(0); setCategory("General"); setTags([]); setTargetDate(""); setMilestones([]); setResources([]);
      setShowCreateForm(false); setSuccess("Skill added successfully!"); await fetchSkills();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Failed to create skill."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try { await API.delete(`/skills/${id}`); setSkills(prev => prev.filter(s => s._id !== id)); setTotal(t => t - 1); } catch (err) { console.error(err); }
  };

  const openEdit = (s: Skill) => {
    setEditingSkill(s); setEditTitle(s.title); setEditDescription(s.description); setEditLevel(s.level);
    setEditProgress(s.progress || 0); setEditCategory(s.category || "General"); setEditTags(s.tags || []);
    setEditTargetDate(s.targetDate ? new Date(s.targetDate).toISOString().split("T")[0] : "");
    setEditMilestones(s.milestones?.map(m => ({ title: m.title, completed: m.completed })) || []);
    setEditResources(s.resources?.map(r => ({ title: r.title, url: r.url, type: r.type })) || []);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    try {
      setEditLoading(true);
      await API.put(`/skills/${editingSkill._id}`, { title: editTitle, description: editDescription, level: editLevel, progress: editProgress, category: editCategory, tags: editTags, targetDate: editTargetDate || null, milestones: editMilestones, resources: editResources });
      setEditingSkill(null); await fetchSkills();
    } catch (err) { console.error(err); }
    finally { setEditLoading(false); }
  };

  // Quick progress update (no modal needed)
  const updateProgress = async (skill: Skill, newProgress: number) => {
    try {
      await API.put(`/skills/${skill._id}`, { progress: newProgress });
      setSkills(prev => prev.map(s => s._id === skill._id ? { ...s, progress: newProgress } : s));
    } catch (err) { console.error(err); }
  };

  // Quick milestone toggle
  const toggleMilestone = async (skill: Skill, milestoneIndex: number) => {
    const updated = skill.milestones.map((m, i) => i === milestoneIndex ? { ...m, completed: !m.completed } : m);
    try {
      await API.put(`/skills/${skill._id}`, { milestones: updated });
      setSkills(prev => prev.map(s => s._id === skill._id ? { ...s, milestones: updated } : s));
    } catch (err) { console.error(err); }
  };

  const canModify = (skill: Skill): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const cid = typeof skill.createdBy === "string" ? skill.createdBy : skill.createdBy?._id || "";
    return cid === user._id;
  };

  const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-surface-950 px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-surface-200/60 mt-1">Manage and track your skills</p>
          </div>
          <div className="flex gap-1 bg-surface-900/60 border border-white/5 rounded-xl p-1">
            {(["skills", "analytics"] as Tab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer capitalize ${activeTab === tab ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25" : "text-surface-200/60 hover:text-white"}`}>
                {tab === "analytics" ? "📊 Analytics" : "📋 Skills"}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* ─── Analytics Tab ─── */}
        {activeTab === "analytics" && <Analytics stats={stats} />}

        {/* ─── Skills Tab ─── */}
        {activeTab === "skills" && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input id="search-input" type="text" placeholder="Search skills..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900/60 border border-white/10 text-white text-sm placeholder:text-surface-200/40 focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all" />
              </div>
              <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-surface-900/60 border border-white/10 text-surface-200 text-sm cursor-pointer">
                <option value="">All Levels</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
              </select>
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-surface-900/60 border border-white/10 text-surface-200 text-sm cursor-pointer">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setShowCreateForm(!showCreateForm)} id="toggle-create-form-btn" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium hover:from-primary-400 hover:to-primary-500 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <svg className={`w-4 h-4 transition-transform duration-200 ${showCreateForm ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {showCreateForm ? "Cancel" : "Add Skill"}
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleCreate} className="bg-surface-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">New Skill</h2>
                {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}

                <div className="grid gap-4 sm:grid-cols-2">
                  <input id="new-skill-title" type="text" placeholder="Skill title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white placeholder:text-surface-200/40 focus:border-primary-400/50 transition-all" />
                  <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-surface-200 cursor-pointer">
                    <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                  </select>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-surface-200 cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-surface-200 cursor-pointer" placeholder="Target date" />
                </div>

                <textarea placeholder="Skill description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full mt-4 px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white placeholder:text-surface-200/40 focus:border-primary-400/50 transition-all resize-none" />

                {/* Progress slider */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-surface-200/60 mb-2">Progress: {progress}%</label>
                  <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-surface-800/60 accent-primary-400 cursor-pointer" />
                </div>

                {/* Extras in a compact grid */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <TagsEditor tags={tags} onChange={setTags} />
                  <MilestoneEditor milestones={milestones} onChange={setMilestones} />
                </div>
                <div className="mt-4">
                  <ResourceLinksEditor resources={resources} onChange={setResources} />
                </div>

                <button type="submit" disabled={loading} id="create-skill-btn" className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 cursor-pointer">
                  {loading ? "Adding..." : "Add Skill"}
                </button>
              </form>
            )}

            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Skills <span className="ml-2 text-sm font-normal text-surface-200/50">{total} total</span></h2>
            </div>

            {/* Skills Grid */}
            {fetching ? (
              <div className="flex items-center justify-center py-20"><svg className="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
            ) : skills.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-900/60 border border-white/5 mb-4"><span className="text-3xl">🎯</span></div>
                <p className="text-surface-200/60 text-lg">No skills found</p>
                <p className="text-surface-200/40 text-sm mt-1">{search || filterLevel || filterCategory ? "Try adjusting your filters" : "Click 'Add Skill' to get started!"}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => {
                    const lc = levelConfig[skill.level];
                    const isExpanded = expandedSkill === skill._id;
                    const hasExtras = (skill.resources?.length > 0) || (skill.milestones?.length > 0);
                    const completedMilestones = skill.milestones?.filter(m => m.completed).length || 0;
                    const deadline = skill.targetDate ? daysUntil(skill.targetDate) : null;
                    return (
                      <div key={skill._id} className="group bg-surface-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:shadow-lg transition-all duration-300 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-1 flex-1 mr-2">{skill.title}</h3>
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${lc.bg} ${lc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${lc.dot}`} />{skill.level}
                          </span>
                        </div>

                        {/* Category + Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-surface-200/50">{skill.category || "General"}</span>
                          {skill.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-300">#{tag}</span>
                          ))}
                          {skill.tags?.length > 3 && <span className="text-[10px] text-surface-200/40">+{skill.tags.length - 3}</span>}
                        </div>

                        <p className="text-surface-200/60 text-sm leading-relaxed line-clamp-2 mb-3">{skill.description}</p>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-surface-200/50">Progress</span>
                            <span className="text-white font-medium">{skill.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-800/60 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${skill.progress >= 80 ? "bg-emerald-400" : skill.progress >= 40 ? "bg-amber-400" : "bg-primary-400"}`} style={{ width: `${skill.progress || 0}%` }} />
                          </div>
                          {canModify(skill) && (
                            <input type="range" min="0" max="100" value={skill.progress || 0} onChange={(e) => updateProgress(skill, Number(e.target.value))} className="w-full h-1 mt-1 rounded-full appearance-none bg-transparent accent-primary-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>

                        {/* Deadline */}
                        {deadline !== null && (
                          <div className={`text-xs mb-2 flex items-center gap-1.5 ${deadline <= 7 ? "text-rose-400" : deadline <= 30 ? "text-amber-400" : "text-surface-200/50"}`}>
                            <span>⏰</span>
                            {deadline > 0 ? `${deadline} day${deadline !== 1 ? "s" : ""} left` : deadline === 0 ? "Due today!" : `${Math.abs(deadline)} day${Math.abs(deadline) !== 1 ? "s" : ""} overdue`}
                          </div>
                        )}

                        {/* Milestones inline */}
                        {skill.milestones?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-surface-200/50 mb-1.5">Milestones {completedMilestones}/{skill.milestones.length}</p>
                            <div className="space-y-1">
                              {skill.milestones.slice(0, isExpanded ? undefined : 2).map((m, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <button type="button" onClick={() => canModify(skill) && toggleMilestone(skill, i)} className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${canModify(skill) ? "cursor-pointer" : "cursor-default"} ${m.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`}>
                                    {m.completed && <span className="text-[8px] text-white">✓</span>}
                                  </button>
                                  <span className={`text-xs ${m.completed ? "line-through text-surface-200/40" : "text-surface-200/70"}`}>{m.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expand toggle */}
                        {hasExtras && (
                          <button type="button" onClick={() => setExpandedSkill(isExpanded ? null : skill._id)} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 mb-3 cursor-pointer">
                            {skill.resources?.length > 0 && <span>🔗 {skill.resources.length} link{skill.resources.length !== 1 ? "s" : ""}</span>}
                            <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}

                        {/* Expanded: resources */}
                        {isExpanded && skill.resources?.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            {skill.resources.map((r, i) => {
                              const cfg = resourceTypeConfig[r.type];
                              return (
                                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-800/40 border border-white/5 hover:border-white/10 transition-all">
                                  <span className={`text-xs font-bold ${cfg.color}`}>{cfg.icon}</span>
                                  <span className="text-xs text-surface-200 truncate flex-1">{r.title}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-surface-200/40">{cfg.label}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {/* Actions */}
                        {canModify(skill) && (
                          <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
                            <button onClick={() => openEdit(skill)} className="flex-1 py-2 rounded-lg text-xs font-medium text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-all cursor-pointer">Edit</button>
                            <button onClick={() => handleDelete(skill._id)} className="flex-1 py-2 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer">Delete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 rounded-lg text-sm bg-surface-900/60 border border-white/10 text-surface-200 hover:bg-white/5 disabled:opacity-30 cursor-pointer">← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer ${p === page ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25" : "bg-surface-900/60 border border-white/10 text-surface-200 hover:bg-white/5"}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 rounded-lg text-sm bg-surface-900/60 border border-white/10 text-surface-200 hover:bg-white/5 disabled:opacity-30 cursor-pointer">Next →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingSkill(null)} />
          <form onSubmit={handleEdit} className="relative bg-surface-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">Edit Skill</h2>
            <div className="space-y-4">
              <input id="edit-skill-title" type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white focus:border-primary-400/50 transition-all" placeholder="Title" />
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white focus:border-primary-400/50 transition-all resize-none" placeholder="Description" />
              <div className="grid grid-cols-2 gap-3">
                <select value={editLevel} onChange={(e) => setEditLevel(e.target.value as Level)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-surface-200 cursor-pointer">
                  <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                </select>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-surface-200 cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200/60 mb-2">Progress: {editProgress}%</label>
                <input type="range" min="0" max="100" value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-surface-800/60 accent-primary-400 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200/60 mb-2">Target Date</label>
                <input type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-surface-200 cursor-pointer" />
              </div>
              <TagsEditor tags={editTags} onChange={setEditTags} />
              <MilestoneEditor milestones={editMilestones} onChange={setEditMilestones} />
              <ResourceLinksEditor resources={editResources} onChange={setEditResources} />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setEditingSkill(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-surface-200 hover:bg-white/5 cursor-pointer">Cancel</button>
              <button type="submit" disabled={editLoading} id="save-edit-btn" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 cursor-pointer">{editLoading ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;