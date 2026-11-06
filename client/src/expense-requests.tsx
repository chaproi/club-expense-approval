import { useEffect, useState, type FormEvent } from "react";

const endpoint = "/api/expense-requests";
const categoryLabels = { EQUIPMENT: "Equipment", ACTIVITY: "Activity", TRAVEL: "Travel" };

type Expense = {
  id: string;
  title: string;
  category: keyof typeof categoryLabels;
  amountBaht: number;
  status: string;
  createdAt: string;
};

type ExpenseWithHistory = Expense & {
  history: { type: string; actorDisplayName: string; createdAt: string; reason: string | null }[];
};

function ExpenseDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<ExpenseWithHistory | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDetail() {
      try {
        const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load expense details.");
        setDetail(await response.json());
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [id]);

  return (
    <section aria-labelledby="expense-details">
      <h3 id="expense-details">Request details</h3>
      {error ? <p role="alert">Could not load request details.</p> : detail ? (
        <>
          <p>{detail.title} · {categoryLabels[detail.category]} · {detail.amountBaht} baht · {detail.status}</p>
          <h4>History</h4>
          <ol>
            {detail.history.map((event, index) => (
              <li key={index}>
                {event.type} by {event.actorDisplayName} · {new Date(event.createdAt).toLocaleString()}
                {event.reason && <p>{event.reason}</p>}
              </li>
            ))}
          </ol>
        </>
      ) : <p role="status">Loading request details…</p>}
    </section>
  );
}

export function ExpenseRequests({ role }: { role: "REQUESTER" | "REVIEWER" }) {
  const [items, setItems] = useState<Expense[] | null>(null);
  const [listError, setListError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState(false);
  const [submission, setSubmission] = useState<{ message: string; ok: boolean } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadList() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load expense requests.");
        const { items } = await response.json();
        setItems(items);
      } catch {
        if (!controller.signal.aborted) setListError(true);
      }
    }

    void loadList();
    return () => controller.abort();
  }, [refresh]);

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setSubmission(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.get("title"),
          category: values.get("category"),
          amountBaht: Number(values.get("amountBaht")),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSubmission({ ok: false, message: data.error?.message ?? "Could not submit the request." });
        return;
      }
      form.reset();
      setSubmission({ ok: true, message: "Request submitted." });
      setSelectedId(data.id);
      setItems(null);
      setListError(false);
      setRefresh((count) => count + 1);
    } catch {
      setSubmission({ ok: false, message: "Could not submit the request." });
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="expense-requests">
      <h2 id="expense-requests">{role === "REQUESTER" ? "My Requests" : "Assigned Requests"}</h2>
      {role === "REQUESTER" && (
        <form onSubmit={submitExpense}>
          <h3>New expense request</h3>
          <p><label>Title <input name="title" required /></label></p>
          <p>
            <label>Category{" "}
              <select name="category" defaultValue="" required>
                <option value="" disabled>Select a category</option>
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </p>
          <p><label>Amount (baht) <input name="amountBaht" type="number" min="1" max="100000" step="1" required /></label></p>
          <button type="submit" disabled={pending}>Submit request</button>
          {submission && <p role={submission.ok ? "status" : "alert"}>{submission.message}</p>}
        </form>
      )}
      {listError ? <p role="alert">Could not load expense requests.</p> : !items ? (
        <p role="status">Loading expense requests…</p>
      ) : items.length === 0 ? <p>No expense requests yet.</p> : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelectedId(item.id)}>{item.title}</button>
              {" · "}{categoryLabels[item.category]} · {item.amountBaht} baht · {item.status}
            </li>
          ))}
        </ul>
      )}
      {selectedId && <ExpenseDetail key={selectedId} id={selectedId} />}
    </section>
  );
}
