import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get<UserProfile>("/users/me");
        setProfile(res.data);
        setEditName(res.data.name);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      setSaving(true);
      const res = await API.put<UserProfile>("/users/me", { name: editName });
      setProfile(res.data);
      setEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-surface-200/60 mt-1">Manage your account information</p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-surface-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">

          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-primary-600 to-accent-500 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-2xl bg-surface-900 border-4 border-surface-950 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-primary-400 to-accent-500 text-white shadow-lg">
                {(profile?.name || user?.name || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pt-14 px-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{profile?.name || user?.name}</h2>
                <p className="text-surface-200/60 text-sm">{profile?.email || user?.email}</p>
              </div>
              {(profile?.role || user?.role) === "admin" && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium border border-amber-500/20">
                  Admin
                </span>
              )}
            </div>

            {profile?.createdAt && (
              <p className="text-surface-200/40 text-xs mt-3">
                Member since {formatDate(profile.createdAt)}
              </p>
            )}
          </div>

          <div className="border-t border-white/5" />

          {/* Edit section */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="edit-profile-name" className="block text-sm font-medium text-surface-200 mb-2">
                    Display Name
                  </label>
                  <input
                    id="edit-profile-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800/60 border border-white/10 text-white focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setEditName(profile?.name || ""); }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-surface-200 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    id="save-profile-btn"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-400 hover:to-primary-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setEditing(true)}
                id="edit-profile-btn"
                className="w-full py-2.5 rounded-xl border border-white/10 text-surface-200 hover:bg-white/5 hover:text-white transition-all text-sm font-medium cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account details */}
        <div className="mt-6 bg-surface-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-surface-200/60 uppercase tracking-wider mb-4">Account Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-surface-200/60">Email</span>
              <span className="text-sm text-white">{profile?.email}</span>
            </div>
            <div className="border-t border-white/5" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-surface-200/60">Role</span>
              <span className="text-sm text-white capitalize">{profile?.role}</span>
            </div>
            <div className="border-t border-white/5" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-surface-200/60">User ID</span>
              <span className="text-xs text-surface-200/40 font-mono">{profile?._id}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
