import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

function prettyDate(iso) {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "long" });
}

const BookingPage = () => {
  const { userId } = useParams();
  const [host, setHost] = useState(null);
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [datesLoading, setDatesLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const bookedSlotKeySet = useMemo(() => {
    const set = new Set();
    for (const b of bookings || []) {
      if (b?.startTime && b?.endTime) {
        set.add(`${b.startTime}-${b.endTime}`);
      }
    }
    return set;
  }, [bookings]);

  const displaySlots = useMemo(() => {
    // Show both available slots and already-booked slots in one grid.
    // availableSlots already excludes booked ones, so we union both lists.
    const map = new Map();

    for (const s of availableSlots || []) {
      if (!s?.start || !s?.end) continue;
      map.set(`${s.start}-${s.end}`, { start: s.start, end: s.end, booked: false });
    }

    for (const b of bookings || []) {
      if (!b?.startTime || !b?.endTime) continue;
      const key = `${b.startTime}-${b.endTime}`;
      map.set(key, { start: b.startTime, end: b.endTime, booked: true });
    }

    const arr = Array.from(map.values());
    arr.sort((a, b) => String(a.start).localeCompare(String(b.start)));
    return arr;
  }, [availableSlots, bookings]);

  const slotKey = useMemo(
    () => (selected ? `${selected.start}-${selected.end}` : ""),
    [selected]
  );

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadHost = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        if (!cancelled) setHost(res.data || null);
      } catch {
        if (!cancelled) setHost(null);
      }
    };

    const loadDates = async () => {
      setDatesLoading(true);
      setLoadError(null);
      try {
        const res = await api.get(`/availability/dates/${userId}`);
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setDates(list);
        setDate((prev) => prev || list[0] || "");
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e?.response?.data?.message || "Could not load available dates."
          );
          setDates([]);
          setDate("");
        }
      } finally {
        if (!cancelled) setDatesLoading(false);
      }
    };

    loadHost();
    loadDates();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !date) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      setSelected(null);
      try {
        const res = await api.get(`/booking/by-user/${userId}`, {
          params: { date },
        });
        if (cancelled) return;
        setAvailableSlots(res.data?.availableSlots || []);
        setBookings(res.data?.bookings || []);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e?.response?.data?.message || "Could not load availability."
          );
          setAvailableSlots([]);
          setBookings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, date]);

  const onBook = async (e) => {
    e.preventDefault();
    if (!selected) {
      setToast({ type: "error", message: "Select a time slot first." });
      return;
    }
    if (!name.trim() || !email.trim()) {
      setToast({ type: "error", message: "Name and email are required." });
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      const res = await api.post("/booking", {
        userId,
        date,
        startTime: selected.start,
        endTime: selected.end,
        name: name.trim(),
        email: email.trim(),
      });
      setToast({
        type: "success",
        message: res.data?.message || "Booking successful.",
      });
      setSelected(null);
      const refresh = await api.get(`/booking/by-user/${userId}`, {
        params: { date },
      });
      setAvailableSlots(refresh.data?.availableSlots || []);
      setBookings(refresh.data?.bookings || []);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err?.response?.data?.message || "Booking failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            to="/users"
            className="text-[13px] font-medium text-[#2F3B8A] hover:underline"
          >
            ← All hosts
          </Link>
          <span className="text-[12px] text-slate-500">Book a slot</span>
        </div>
      </header>

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1E2E63] mb-1">
          Book a time{host?.name ? ` with ${host.name}` : ""}
        </h1>
        <p className="text-[13px] text-slate-600 mb-6">
          Choose an available date, pick a free slot, then enter your details.
        </p>

        <div className="mb-6">
          <h2 className="text-[12px] font-semibold text-slate-700 mb-2">
            Available dates
          </h2>

          {datesLoading ? (
            <p className="text-[13px] text-slate-500">Loading dates…</p>
          ) : dates.length === 0 ? (
            <p className="text-[13px] text-slate-600">
              No available dates yet for this host.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dates.map((d) => {
                const active = d === date;
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDate(d)}
                    className={[
                      "px-3 py-2 rounded-lg text-[13px] font-medium border transition",
                      active
                        ? "bg-[#2F3B8A] text-white border-[#2F3B8A]"
                        : "bg-white text-slate-800 border-slate-200 hover:border-[#2F3B8A]/50",
                    ].join(" ")}
                  >
                    {prettyDate(d)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {loading && (
          <p className="text-[13px] text-slate-500 mb-4">Loading slots…</p>
        )}
        {loadError && (
          <p className="text-[13px] text-red-600 mb-4" role="alert">
            {loadError}
          </p>
        )}

        {!loading && !loadError && (
          <>
            <h2 className="text-[14px] font-semibold text-[#1E2E63] mb-2">
              Available slots
            </h2>
            {displaySlots.length === 0 ? (
              <p className="text-[13px] text-slate-600 mb-6">
                No open slots for this date. Try another day or pick a host who
                has set availability.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-8">
                {displaySlots.map((slot) => {
                  const active =
                    selected?.start === slot.start && selected?.end === slot.end;
                  const isBooked =
                    slot.booked || bookedSlotKeySet.has(`${slot.start}-${slot.end}`);
                  return (
                    <button
                      type="button"
                      key={`${slot.start}-${slot.end}`}
                      disabled={isBooked}
                      onClick={() => {
                        if (!isBooked) setSelected(slot);
                      }}
                      className={[
                        "px-3 py-2 rounded-lg text-[13px] font-medium border transition",
                        isBooked
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "",
                        active
                          ? "bg-[#2F3B8A] text-white border-[#2F3B8A]"
                          : "bg-white text-slate-800 border-slate-200 hover:border-[#2F3B8A]/50",
                      ].join(" ")}
                    >
                      <span>{slot.start} – {slot.end}</span>
                      {isBooked && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-slate-200 px-2 py-[2px] text-[10px] font-semibold text-slate-600">
                          Booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <form onSubmit={onBook} className="space-y-4 max-w-md">
          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-2">
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-[#2F3B8A]/30"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-[#2F3B8A]/30"
              placeholder="jane@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !slotKey}
            className="h-11 px-6 rounded-lg bg-[#2F3B8A] text-white text-[13px] font-medium disabled:opacity-50"
          >
            {submitting ? "Booking…" : "Confirm booking"}
          </button>
        </form>

        {toast && (
          <div
            className={[
              "fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-white text-[13px]",
              toast.type === "success" ? "bg-green-600" : "bg-red-600",
            ].join(" ")}
            role="status"
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
