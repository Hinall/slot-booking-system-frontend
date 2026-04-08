import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logoutAllDevices, logoutUser } from "../api/auth.api";
import { createAvailability, getMyAvailabilities } from "../api/availability.api";
import api from "../api/axios";

function formatPrettyDate(iso) {
  // iso expected YYYY-MM-DD
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "long" });
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedBookings, setExpandedBookings] = useState({});
  const [expandedLoading, setExpandedLoading] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileWrapRef = useRef(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "" });
  const [saving, setSaving] = useState(false);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const refreshAvailabilities = async () => {
    const data = await getMyAvailabilities();
    setAvailabilities(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/signin");
          return;
        }

        const meRes = await getMe();
        if (cancelled) return;
        setMe(meRes?.user || null);

        await refreshAvailabilities();
      } catch {
        localStorage.removeItem("accessToken");
        navigate("/signin");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();

    const onStorage = (e) => {
      if (e.key === "accessToken" && !e.newValue) {
        navigate("/signin");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      const el = profileWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setProfileOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onLogout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
  };

  const onLogoutAll = async () => {
    try {
      await logoutAllDevices();
    } finally {
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
  };

  const sorted = useMemo(() => {
    return [ ...availabilities ].sort((a, b) => {
      if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
      return String(a.startTime).localeCompare(String(b.startTime));
    });
  }, [availabilities]);

  const loadBookingsForAvailability = async (availability) => {
    const date = availability.date;
    const userId = me?.id;
    if (!userId || !date) return;

    setExpandedLoading((prev) => ({ ...prev, [availability._id]: true }));
    try {
      const res = await api.get(`/booking/by-user/${userId}`, { params: { date } });
      const bookings = res.data?.bookings || [];
      setExpandedBookings((prev) => ({ ...prev, [availability._id]: bookings }));
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Could not load bookings.");
      setExpandedBookings((prev) => ({ ...prev, [availability._id]: [] }));
    } finally {
      setExpandedLoading((prev) => ({ ...prev, [availability._id]: false }));
    }
  };

  const toggleAccordion = async (availability) => {
    const id = availability._id;
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next && expandedBookings[id] === undefined) {
      await loadBookingsForAvailability(availability);
    }
  };

  const onSaveAvailability = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) {
      showToast("error", "All fields required.");
      return;
    }
    if (form.startTime >= form.endTime) {
      showToast("error", "Invalid time range.");
      return;
    }

    setSaving(true);
    try {
      await createAvailability({
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      showToast("success", "Availability added.");
      setShowAdd(false);
      setForm({ date: "", startTime: "", endTime: "" });
      await refreshAvailabilities();
    } catch (e2) {
      showToast("error", e2?.response?.data?.message || "Could not save availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-[#1E2E63]">Connect</h1>
            <p className="text-[12px] text-slate-500">
              {me?.username
                ? `Welcome back, ${me.username}`
                : "Manage your availability below."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Share booking link"
              onClick={async () => {
                const id = me?.id;
                if (!id) {
                  showToast("error", "User id not available yet.");
                  return;
                }

                const url = `${window.location.origin}/book/${id}`;

                try {
                  if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(url);
                  } else {
                    const ta = document.createElement("textarea");
                    ta.value = url;
                    ta.setAttribute("readonly", "true");
                    ta.style.position = "fixed";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                  }
                  showToast("success", "Booking link copied to clipboard.");
                } catch {
                  showToast("error", "Could not copy link. Please try again.");
                }
              }}
              className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-slate-300 inline-flex items-center gap-2"
              aria-label="Share booking link"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 .17 1.01L8.91 8.24a3 3 0 0 0-1.91-.69 3 3 0 1 0 2.74 4.23l4.46 2.67A3 3 0 0 0 14 16a3 3 0 1 0 .62-1.83l-4.46-2.67c.05-.16.08-.33.1-.5l4.26-3.23A3 3 0 0 0 16 8Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[12px] font-medium text-slate-600">
                Share booking link
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="h-9 px-4 rounded-lg bg-[#2F3B8A] text-white text-[13px] font-medium"
            >
              Add availability
            </button>

            <div className="relative" ref={profileWrapRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="h-9 w-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-slate-300 grid place-items-center"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                title="Profile"
              >
                <span className="text-[14px] font-semibold">
                  {(me?.username || me?.email || "?").trim().charAt(0).toUpperCase()}
                </span>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-[12px] font-semibold text-slate-800 truncate">
                      {me?.username || "Profile"}
                    </div>
                    <div className="text-[12px] text-slate-500 truncate">
                      {me?.email || ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogoutAll();
                    }}
                    className="w-full text-left px-4 py-3 text-[13px] text-slate-800 hover:bg-slate-50"
                  >
                    Logout from all devices
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-[13px] text-slate-500">Loading…</p>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#1E2E63]">
                Your availabilities
              </h2>
              <span className="text-[12px] text-slate-500">
                {sorted.length} total
              </span>
            </div>

            {sorted.length === 0 ? (
              <div className="p-5 text-[13px] text-slate-600">
                No availability yet. Click <b>Add availability</b> to create one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sorted.map((a) => {
                  const expanded = expandedId === a._id;
                  const pretty = formatPrettyDate(a.date);
                  const bookings = expandedBookings[a._id] || [];
                  const isBookingsLoading = !!expandedLoading[a._id];

                  return (
                    <div key={a._id}>
                      <button
                        type="button"
                        onClick={() => toggleAccordion(a)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 text-left"
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-slate-900 truncate">
                            {pretty} → {a.startTime} - {a.endTime}
                          </div>
                          <div className="text-[12px] text-slate-500">
                            Click to {expanded ? "hide" : "view"} bookings
                          </div>
                        </div>
                        <div className="text-slate-400 text-[18px]">
                          {expanded ? "▾" : "▸"}
                        </div>
                      </button>

                      {expanded && (
                        <div className="px-5 pb-5">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-[13px] font-semibold text-[#1E2E63]">
                                Bookings for {pretty}
                              </div>
                              <button
                                type="button"
                                disabled={isBookingsLoading}
                                onClick={() => loadBookingsForAvailability(a)}
                                className="text-[12px] font-medium text-[#2F3B8A] hover:underline disabled:opacity-60"
                              >
                                Refresh
                              </button>
                            </div>

                            {isBookingsLoading ? (
                              <div className="text-[13px] text-slate-500">
                                Loading bookings…
                              </div>
                            ) : bookings.length === 0 ? (
                              <div className="text-[13px] text-slate-600">
                                No bookings yet for this date.
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {bookings.map((b) => (
                                  <li
                                    key={b._id}
                                    className="bg-white border border-slate-200 rounded-lg p-3"
                                  >
                                    <div className="text-[13px] font-semibold text-slate-900">
                                      {b.startTime} - {b.endTime}
                                    </div>
                                    <div className="text-[12px] text-slate-600">
                                      {b.visitorId?.name || "Visitor"}{" "}
                                      <span className="text-slate-400">
                                        ({b.visitorId?.email || "—"})
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#1E2E63]">
                Add availability
              </div>
              <button
                type="button"
                onClick={() => !saving && setShowAdd(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSaveAvailability} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-800 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-[#2F3B8A]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-2">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startTime: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-[#2F3B8A]/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-2">
                    End time
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, endTime: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-[#2F3B8A]/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowAdd(false)}
                  className="w-full h-10 rounded-lg bg-slate-100 text-slate-800 text-[13px] font-medium disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-10 rounded-lg bg-[#2F3B8A] text-white text-[13px] font-medium disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-[60]">
          <div
            className={[
              "px-4 py-3 rounded-lg shadow-lg text-white text-[13px] flex items-start gap-2",
              toast.type === "success" ? "bg-green-600" : "bg-red-600",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <div className="font-semibold">
              {toast.type === "success" ? "Success" : "Error"}
            </div>
            <div className="leading-4">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;