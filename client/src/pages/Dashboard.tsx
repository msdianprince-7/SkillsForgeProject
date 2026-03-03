import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";

interface Skill {
  _id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

interface SkillResponse {
  total: number;
  page: number;
  pages: number;
  data: Skill[];
}

const levelColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-700 border border-amber-200",
  Advanced: "bg-rose-100 text-rose-700 border border-rose-200",
};

const Dashboard = () => {
  const { user } = useAuth();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Beginner"
  );

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔹 Fetch skills
  const fetchSkills = async () => {
    try {
      setFetching(true);
      const res = await API.get<SkillResponse>("/skills");
      setSkills(res.data.data);
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setFetching(false);
    }
  };

  // 🔹 Load on mount
  useEffect(() => {
    void fetchSkills();
  }, []);

  // 🔹 Create skill
  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await API.post("/skills", { title, description, level });

      setTitle("");
      setDescription("");
      setLevel("Beginner");

      setSuccess("Skill added successfully!");
      await fetchSkills();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error creating skill:", err);
      setError("Failed to create skill.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete skill (Admin only)
  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/skills/${id}`);
      setSkills((prev) => prev.filter((skill) => skill._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and track your skills</p>
        </div>

        {/* Create Skill */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <h2 className="text-xl font-semibold mb-6">Add New Skill</h2>

          <div className="flex flex-col gap-4">

            <input
              type="text"
              placeholder="Skill title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Skill description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={level}
              onChange={(e) =>
                setLevel(
                  e.target.value as "Beginner" | "Intermediate" | "Advanced"
                )
              }
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {error && (
              <p className="text-rose-600 text-sm bg-rose-50 p-2 rounded">
                {error}
              </p>
            )}

            {success && (
              <p className="text-emerald-600 text-sm bg-emerald-50 p-2 rounded">
                {success}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Skill"}
            </button>
          </div>
        </div>

        {/* Skills Grid */}
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Skills</h2>
            <span className="text-sm text-gray-400">
              {skills.length} skill{skills.length !== 1 ? "s" : ""}
            </span>
          </div>

          {fetching ? (
            <p className="text-gray-400">Loading skills...</p>
          ) : skills.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🎯</p>
              <p>No skills yet. Add your first one!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition"
                >
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-semibold">{skill.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        levelColors[skill.level]
                      }`}
                    >
                      {skill.level}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm">
                    {skill.description}
                  </p>

                  {/* 👑 Admin Delete */}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(skill._id)}
                      className="mt-4 bg-rose-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-rose-600 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;