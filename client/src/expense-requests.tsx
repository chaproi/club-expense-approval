import { useCallback, useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";

const endpoint = "/api/expense-requests";
const categoryLabels = { EQUIPMENT: "Equipment", ACTIVITY: "Activity", TRAVEL: "Travel" };
const categoryCeilings = { EQUIPMENT: 120000, ACTIVITY: 150000, TRAVEL: 100000 };

function amountPolicy(category: string, amount: string) {
  const known = Object.hasOwn(categoryCeilings, category);
  const ceiling = known ? categoryCeilings[category as keyof typeof categoryCeilings] : undefined;
  const number = Number(amount);
  return {
    ceiling,
    valid: ceiling !== undefined && Number.isInteger(number) && number >= 1 && number <= ceiling,
    message: ceiling === undefined ? "Select a category to see its whole-baht range."
      : `${categoryLabels[category as keyof typeof categoryLabels]}: enter a whole amount from 1 to ${ceiling.toLocaleString("en-US")} baht.`,
  };
}

type Expense = {
  id: string;
  title: string;
  category: keyof typeof categoryLabels;
  amountBaht: number;
  status: string;
  revision: number;
  createdAt: string;
};

type ExpenseWithHistory = Expense & {
  history: { type: string; actorDisplayName: string; createdAt: string; reason: string | null }[];
};

type EditValues = { title: string; category: Expense["category"]; amountBaht: string };
type EditField = keyof EditValues;
type Draft = {
  base: { revision: number; values: EditValues };
  values: EditValues;
  changedFields: EditField[];
  restored: boolean;
};
type Drafts = ReadonlyMap<string, Draft>;

const editLabels = { title: "Title", category: "Category", amountBaht: "Amount (baht)" } satisfies Record<EditField, string>;
const editFields: EditField[] = ["title", "category", "amountBaht"];

function savedValues(detail: Expense): EditValues {
  return { title: detail.title, category: detail.category, amountBaht: String(detail.amountBaht) };
}

function sameValue(field: EditField, left: EditValues, right: EditValues) {
  if (field === "title") return left.title.trim() === right.title.trim();
  if (field === "amountBaht") return Number(left.amountBaht) === Number(right.amountBaht);
  return left.category === right.category;
}

function captureDraft(detail: Expense, values: EditValues, restored = false): Draft {
  const base = { revision: detail.revision, values: savedValues(detail) };
  return { base, values, changedFields: editFields.filter(field => !sameValue(field, base.values, values)), restored };
}

function displayValue(values: EditValues, field: EditField) {
  return field === "category" ? categoryLabels[values.category] : values[field];
}

function FieldValues({ values }: { values: EditValues }) {
  return <dl className="field-values">{editFields.map(field => (
    <div key={field}><dt>{editLabels[field]}</dt><dd>{displayValue(values, field)}</dd></div>
  ))}</dl>;
}

function accessDenied(status: number) {
  return status === 401 || status === 403 || status === 404;
}

const mutations = {
  save: { suffix: "", method: "PATCH", error: "Could not save changes." },
  resubmit: { suffix: "/resubmit", method: "POST", error: "Could not resubmit the request." },
  decision: { suffix: "/decision", method: "POST", error: "Could not save the decision." },
} as const;

function ExpenseDetail({ id, role, onRefresh, draft, setDrafts }: {
  id: string;
  role: "REQUESTER" | "REVIEWER";
  onRefresh: () => void;
  draft: Draft | undefined;
  setDrafts: Dispatch<SetStateAction<Drafts>>;
}) {
  const [detail, setDetail] = useState<ExpenseWithHistory | null>(null);
  const [loadError, setLoadError] = useState<{ kind: "failed" | "denied"; message: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [reload, setReload] = useState(0);
  const [editValues, setEditValues] = useState<EditValues | null>(null);
  const detailUrl = endpoint + "/" + encodeURIComponent(id);

  const updateDraft = useCallback((next?: Draft) => {
    setDrafts(previous => {
      if (!next && !previous.has(id)) return previous;
      const drafts = new Map(previous);
      if (next) drafts.set(id, next);
      else drafts.delete(id);
      return drafts;
    });
  }, [id, setDrafts]);

  const denyDetail = useCallback((status: number, message?: string, actionError = "Could not load request details.") => {
    if (status === 401) setDrafts(previous => previous.size ? new Map() : previous);
    else updateDraft();
    setDetail(null);
    setEditValues(null);
    setLoadError({ kind: "denied", message: actionError + " " + (message || "Sign in again if your session ended.") });
  }, [setDrafts, updateDraft]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDetail() {
      try {
        const response = await fetch(detailUrl, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (accessDenied(response.status)) {
          const failure = await response.json().catch(() => null);
          if (!controller.signal.aborted) denyDetail(response.status, failure?.error?.message);
          return;
        }
        if (!response.ok) throw new Error("Could not load expense details.");
        const saved: ExpenseWithHistory = await response.json();
        if (!controller.signal.aborted) setDetail(saved);
      } catch {
        if (!controller.signal.aborted) setLoadError({ kind: "failed", message: "Could not load request details." });
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [detailUrl, reload, denyDetail]);

  const current = detail && savedValues(detail);
  const recovering = !!draft && (!detail || !draft.restored || draft.base.revision !== detail.revision || detail.status !== "RETURNED");
  const editable = role === "REQUESTER" && detail?.status === "RETURNED" && !recovering;
  const values = editValues ?? (draft?.restored && !recovering ? draft.values : current);
  const dirty = !!current && !!values && editFields.some(field => !sameValue(field, current, values));
  const editAmountPolicy = amountPolicy(values?.category ?? "", values?.amountBaht ?? "");

  function refreshDetail() {
    setDetail(null);
    setLoadError(null);
    setEditValues(null);
    setReload(count => count + 1);
    onRefresh();
  }

  function stageRestoredDraft(saved: Expense, next: EditValues) {
    const staged = captureDraft(saved, next, true);
    const hasChanges = staged.changedFields.length > 0;
    setEditValues(hasChanges ? next : null);
    updateDraft(hasChanges ? staged : undefined);
  }

  function restoreDraft() {
    if (!detail || detail.status !== "RETURNED" || !current || !draft) return;
    const next = { ...current };
    for (const field of draft.changedFields) {
      Object.assign(next, { [field]: draft.values[field] });
    }
    stageRestoredDraft(detail, next);
    setMutationError("");
  }

  function discardDraft() {
    updateDraft();
    setEditValues(null);
    setMutationError("");
  }

  function changeEdit(next: EditValues) {
    setSaveNotice("");
    if (detail && draft?.restored) stageRestoredDraft(detail, next);
    else setEditValues(next);
  }

  async function mutate(action: keyof typeof mutations, body: object, attempted?: Draft) {
    if (!detail || pending) return;
    const operation = mutations[action];
    setPending(true);
    setMutationError("");
    setSaveNotice("");
    try {
      const response = await fetch(detailUrl + operation.suffix, {
        method: operation.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, expectedRevision: detail.revision }),
      });
      if (action !== "decision" && accessDenied(response.status)) {
        const failure = await response.json().catch(() => null);
        denyDetail(response.status, failure?.error?.message, operation.error);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        const message = data.error?.message;
        setMutationError(message
          ? action === "decision" ? message : operation.error + " " + message
          : operation.error);
        if (response.status === 409) {
          if (attempted && data.error?.code === "INVALID_STATE") updateDraft(attempted);
          refreshDetail();
        }
        return;
      }
      setDetail(data);
      setEditValues(null);
      if (action === "save" || action === "resubmit") updateDraft();
      if (action === "save") setSaveNotice("Changes saved.");
      onRefresh();
    } catch {
      setMutationError(action === "decision" ? operation.error : operation.error + " Try again.");
    } finally {
      setPending(false);
    }
  }

  function decide(body: { decision: "APPROVED" } | { decision: "REJECTED" | "RETURNED"; reason: string }) {
    return mutate("decision", body);
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    void decide({ decision: "REJECTED", reason: String(values.get("reason") ?? "") });
  }

  function returnForCorrection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    void decide({ decision: "RETURNED", reason: String(values.get("returnReason") ?? "") });
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail || !editable || !values || !dirty || !editAmountPolicy.valid) return;
    void mutate("save", { ...values, amountBaht: Number(values.amountBaht) }, captureDraft(detail, values));
  }

  const conflicts = draft && current ? draft.changedFields.filter(field =>
    !sameValue(field, draft.base.values, current) && !sameValue(field, draft.values, current)) : [];

  return (
    <section className="panel detail-panel" aria-labelledby="expense-details" aria-busy={pending}>
      <h3 id="expense-details">Request details</h3>
      {pending && <p className="loading" role="status">Updating your request…</p>}
      {loadError?.kind !== "denied" && mutationError && <p role="alert">{mutationError}</p>}
      {saveNotice && <p role="status">{saveNotice}</p>}
      {loadError ? (
        <p role="alert">{loadError.message}</p>
      ) : detail ? (
        <>
          {recovering && current && (
            <section className="saved-panel" aria-labelledby="latest-saved-values">
              <h4 id="latest-saved-values">Latest saved values</h4>
              <FieldValues values={current} />
              <p>Status: {detail.status} · Revision: {detail.revision}</p>
            </section>
          )}
          <div className="detail-overview">
            <div className="detail-metadata"><span className={"status-tag status-" + detail.status.toLowerCase()}>{detail.status}</span><span className="category">{categoryLabels[detail.category]}</span></div>
            <p className="detail-title">{detail.title}</p>
            <p className="detail-amount">{detail.amountBaht.toLocaleString()}<small>baht</small></p>
          </div>
          {role === "REVIEWER" && detail.status === "SUBMITTED" && (
            <div className="decision-panel">
              <button type="button" disabled={pending} onClick={() => void decide({ decision: "APPROVED" })}>Approve</button>
              <form onSubmit={reject}>
                <p><label>Rejection reason <textarea name="reason" required disabled={pending} /></label></p>
                <button className="danger" type="submit" disabled={pending}>Reject</button>
              </form>
              <form onSubmit={returnForCorrection}>
                <p><label>Return reason <textarea name="returnReason" required maxLength={300} disabled={pending} /></label></p>
                <button className="secondary" type="submit" disabled={pending}>Return for correction</button>
              </form>
            </div>
          )}
          {editable && values && (
            <div className="edit-panel">
              <form onSubmit={saveEdit}>
                <h4>Correct returned request</h4>
                <p><label>Corrected title <input name="editTitle" value={values.title} onChange={event => changeEdit({ ...values, title: event.currentTarget.value })} required maxLength={120} disabled={pending} /></label></p>
                <p><label htmlFor="expense-edit-category">Corrected category</label>{" "}<select id="expense-edit-category" name="editCategory" value={values.category} onChange={event => changeEdit({ ...values, category: event.currentTarget.value as Expense["category"] })} disabled={pending}>
                  {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></p>
                <p><label>Corrected amount (baht) <input name="editAmount" type="number" min="1" max={editAmountPolicy.ceiling} step="1" value={values.amountBaht} onChange={event => changeEdit({ ...values, amountBaht: event.currentTarget.value })} required disabled={pending} aria-describedby="expense-edit-limit" aria-invalid={!editAmountPolicy.valid || undefined} /></label></p>
                <p id="expense-edit-limit" role={!editAmountPolicy.valid ? "alert" : undefined}>{editAmountPolicy.message}</p>
                <button type="submit" disabled={pending || !dirty || !editAmountPolicy.valid}>Save changes</button>
              </form>
              {dirty && <p role="status">Save your changes before resubmitting.</p>}
              <button type="button" disabled={pending || dirty} onClick={() => void mutate("resubmit", {})}>Resubmit request</button>
              {draft?.restored && <button type="button" disabled={pending} onClick={discardDraft}>Discard draft</button>}
            </div>
          )}
          <h4 className="history-title">History</h4>
          <ol className="history">
            {detail.history.map((event, index) => (
              <li key={index}>
                <div className="history-line">{event.type} by {event.actorDisplayName}<time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time></div>
                {event.reason && <p>{event.reason}</p>}
              </li>
            ))}
          </ol>
        </>
      ) : <p role="status" className="loading">Loading request details…</p>}
      {draft && recovering && (detail || loadError?.kind === "failed") && (
        <section className="draft-panel" aria-labelledby="unsaved-draft">
          <h4 id="unsaved-draft">Unsaved draft</h4>
          <FieldValues values={draft.values} />
          {detail?.status === "RETURNED" && (
            <>
              <p>Restore applies your changed fields to the latest values as unsaved edits.</p>
              <button type="button" disabled={pending} onClick={restoreDraft}>Restore draft</button>
            </>
          )}
          {detail && detail.status !== "RETURNED" && <p>This request is read-only.</p>}
          <button type="button" disabled={pending} onClick={discardDraft}>Discard draft</button>
        </section>
      )}
      {draft && recovering && current && conflicts.length > 0 && (
        <ul className="conflict-list">{conflicts.map(field => (
          <li key={field}>
            <strong>{editLabels[field]} conflict</strong>
            <div>Latest saved: {displayValue(current, field)}</div>
            <div>Your draft: {displayValue(draft.values, field)}</div>
          </li>
        ))}</ul>
      )}
      {loadError?.kind === "failed" && role === "REQUESTER" && (
        <button type="button" onClick={refreshDetail}>Retry loading latest details</button>
      )}
    </section>
  );
}

export function ExpenseRequests({ role }: { role: "REQUESTER" | "REVIEWER" }) {
  // App keys this view by signed-in user. Logout and account changes unmount it.
  const [drafts, setDrafts] = useState<Drafts>(() => new Map());
  const [items, setItems] = useState<Expense[] | null>(null);
  const [listError, setListError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState(false);
  const [submission, setSubmission] = useState<{ message: string; ok: boolean } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const newAmountPolicy = amountPolicy(newCategory, newAmount);

  useEffect(() => {
    const controller = new AbortController();
    async function loadList() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load expense requests.");
        const { items } = await response.json();
        if (!controller.signal.aborted) {
          setListError(false);
          setItems(items);
        }
      } catch {
        if (!controller.signal.aborted) setListError(true);
      }
    }

    void loadList();
    return () => controller.abort();
  }, [refresh]);

  async function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !newAmountPolicy.valid) return;
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
      setNewCategory("");
      setNewAmount("");
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
    <section className="workspace entrance" aria-labelledby="expense-requests">
      <div className="workspace-heading">
        <div><p className="eyebrow">Club expenses</p><h2 id="expense-requests">{role === "REQUESTER" ? "My Requests" : "Assigned Requests"}</h2></div>
        <p>{role === "REQUESTER" ? "From the first idea to the final approval. Keep your club expenses moving." : "Review the details, make a decision, and help the next club project happen."}</p>
      </div>
      {role === "REVIEWER" && <StatusSummary refresh={refresh} />}
      {drafts.size > 0 && <p className="draft-warning" role="status">Reloading this page will discard your unsaved draft.</p>}
      <div className={"workspace-grid" + (role === "REVIEWER" ? " reviewer-grid" : "")}>
      {role === "REQUESTER" && (
        <form className="panel creation-panel" aria-busy={pending} onSubmit={submitExpense}>
          <h3>New expense request</h3>
          <p className="panel-caption">A little detail now keeps the approval simple.</p>
          <p><label>Title <input name="title" required /></label></p>
          <p>
            <label>Category{" "}
              <select name="category" value={newCategory} onChange={event => setNewCategory(event.currentTarget.value)} required disabled={pending}>
                <option value="" disabled>Select a category</option>
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </p>
          <p><label>Amount (baht) <input name="amountBaht" type="number" min="1" max={newAmountPolicy.ceiling} step="1" value={newAmount} onChange={event => setNewAmount(event.currentTarget.value)} required disabled={pending} aria-describedby="expense-create-limit" aria-invalid={newAmount !== "" && !newAmountPolicy.valid || undefined} /></label></p>
          <p id="expense-create-limit" role={newAmount !== "" && !newAmountPolicy.valid ? "alert" : undefined}>{newAmountPolicy.message}</p>
          <button type="submit" disabled={pending || !newAmountPolicy.valid}>Submit request</button>
          {submission && <p role={submission.ok ? "status" : "alert"}>{submission.message}</p>}
        </form>
      )}
      <div className="panel list-panel"><div className="panel-heading"><h3>Requests</h3>{items && <span className="record-count">{items.length} {items.length === 1 ? "request" : "requests"}</span>}</div>
      {listError ? (
        <div className="empty-list">
          <p role="alert">Could not load expense requests.</p>
          {role === "REQUESTER" && <button type="button" onClick={() => setRefresh(count => count + 1)}>Retry loading requests</button>}
        </div>
      ) : !items ? (
        <p role="status" className="loading">Loading expense requests…</p>
      ) : items.length === 0 ? <p className="empty-list">No expense requests yet.</p> : (
        <ul className="request-list">
          {items.map((item) => (
            <li key={item.id}>
              <button className="request-card" type="button" aria-label={item.title} aria-current={selectedId === item.id ? "true" : undefined} onClick={() => setSelectedId(item.id)}>
                <span className="request-topline"><span className="category">{categoryLabels[item.category]}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></span>
                <span className="request-title">{item.title}</span>
                <span className="request-bottomline"><span className="request-amount">{item.amountBaht.toLocaleString()} <small>baht</small></span><span className={"status-tag status-" + item.status.toLowerCase()}>{item.status}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      </div>
      {selectedId ? <ExpenseDetail key={selectedId} id={selectedId} role={role} draft={drafts.get(selectedId)} setDrafts={setDrafts} onRefresh={() => setRefresh(count => count + 1)} /> : (
        <div className="panel empty-detail"><svg aria-hidden="true" viewBox="0 0 48 48" fill="none"><path d="M13 7h16l8 8v26H13V7Zm16 0v9h8M20 24h10m-10 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg><h3>A closer look</h3><p>Select a request to see its details, decisions, and history.</p></div>
      )}
      </div>
    </section>
  );
}

function StatusSummary({ refresh }: { refresh: number }) {
  const [summary, setSummary] = useState<{ counts: Record<string, number>; total: number } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    void fetch(`${endpoint}/summary`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Could not load summary.");
      const data = await response.json();
      if (!controller.signal.aborted) setSummary(data);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [refresh]);
  return <section className="panel summary-panel" aria-labelledby="status-summary"><h3 id="status-summary">Status summary</h3>
    {error ? <p role="alert">Could not load status summary.</p> : summary ? <>
      <dl>{Object.entries(summary.counts).map(([status, count]) => <div key={status}><dt>{status}</dt><dd data-testid={`summary-${status}`}>{count}</dd></div>)}</dl>
      <p>Total requests: <span data-testid="summary-total">{summary.total}</span></p>
    </> : <p role="status" className="loading">Loading status summary…</p>}
  </section>;
}
