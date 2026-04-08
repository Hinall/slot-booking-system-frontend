import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function avatarLetter(name) {
  const s = (name || "?").trim();
  return s.charAt(0).toUpperCase();
}

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [onlyWithAvailability, setOnlyWithAvailability] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = onlyWithAvailability ? { hasAvailability: "true" } : {};
        const res = await api.get("/users", { params });
        if (!cancelled) setUsers(res.data || []);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || "Could not load users.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [onlyWithAvailability]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || u.username || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-[13px] font-medium text-[#2F3B8A] hover:underline"
          >
            ← Back 
          </Link>
          <span className="text-[12px] text-slate-500">Visitor booking</span>
        </div>
      </header>

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1E2E63] mb-1">Select a host</h1>
        <p className="text-[13px] text-slate-600 mb-6">
          Choose someone to view their availability and book a time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-[#2F3B8A]/30 focus:border-[#2F3B8A]"
            aria-label="Search users"
          />
          <label className="flex items-center gap-2 text-[13px] text-slate-700 whitespace-nowrap cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyWithAvailability}
              onChange={(e) => setOnlyWithAvailability(e.target.checked)}
              className="rounded border-slate-300"
            />
            Only hosts with availability
          </label>
        </div>

        {loading && (
          <p className="text-[13px] text-slate-500">Loading hosts…</p>
        )}
        {error && (
          <p className="text-[13px] text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-[13px] text-slate-600">
            {users.length === 0
              ? "No hosts match your filters yet."
              : "No hosts match your search."}
          </p>
        )}

        <div className="grid gap-3">
          {filtered.map((user) => (
            <button
              type="button"
              key={user._id}
              className="text-left border border-slate-200 bg-white p-4 rounded-xl shadow-sm hover:shadow-md hover:border-[#2F3B8A]/40 transition cursor-pointer flex items-center gap-4"
              onClick={() => navigate(`/book/${user._id}`)}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2F3B8A] text-white text-lg font-semibold"
                aria-hidden
              >
                {avatarLetter(user.name || user.username)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#1E2E63] truncate">
                  {user.name || user.username}
                </h2>
                <p className="text-[13px] text-slate-500 truncate">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
