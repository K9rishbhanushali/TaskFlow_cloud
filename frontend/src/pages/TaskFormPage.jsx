import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SUBJECTS } from "../utils/mockData.js";
import { ALLOWED_PRIORITIES, ALLOWED_STATUSES } from "../utils/helpers.js";
import { taskService } from "../services/taskService.js";
import { apiErrorMessage } from "../services/api.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useToast } from "../context/ToastContext.jsx";

// Shared create/edit form. Route /tasks/new means create mode.
export default function TaskFormPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { push } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let live = true;
    taskService
      .get(id)
      .then((t) => {
        if (!live) return;
        setTitle(t.title);
        setDescription(t.description || "");
        setSubject(t.subject || SUBJECTS[0]);
        setPriority(t.priority);
        setStatus(t.status);
        setDueDate(t.due_date ? t.due_date.slice(0, 10) : "");
        setLoading(false);
      })
      .catch((err) => live && setError(apiErrorMessage(err, "Could not load task.")));
    return () => { live = false; };
  }, [id, isNew]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) return setError("Title needs at least 3 characters.");
    if (!subject.trim()) return setError("Subject is required.");
    setBusy(true);
    const payload = {
      title: title.trim(),
      description,
      subject: subject.trim(),
      priority,
      status,
      due_date: dueDate || null,
    };
    try {
      if (isNew) {
        await taskService.create(payload);
        push("Task created.");
      } else {
        await taskService.update(id, payload);
        push("Task saved.");
      }
      navigate("/tasks");
    } catch (err) {
      const fields = err?.response?.data?.fields;
      const detail = fields ? Object.values(fields).join(" ") : apiErrorMessage(err, "Save failed.");
      setError(detail);
    } finally {
      setBusy(false);
    }
  };

  if (loading && !error) return <LoadingSpinner label="Loading task…" />;

  return (
    <div className="tf-glass p-6">
      <h1 className="text-2xl font-bold">{isNew ? "New task" : "Edit task"}</h1>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm" htmlFor="task-title">Title *</label>
          <input id="task-title" className="tf-input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm" htmlFor="task-desc">Description</label>
          <textarea id="task-desc" rows={3} className="tf-input mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-sm" htmlFor="task-subject">Subject *</label>
          <input id="task-subject" className="tf-input mt-1" list="tf-subjects" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <datalist id="tf-subjects">
            {SUBJECTS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div>
          <label className="text-sm" htmlFor="task-due">Due date</label>
          <input id="task-due" type="date" className="tf-input mt-1" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm" htmlFor="task-priority">Priority</label>
          <select id="task-priority" className="tf-input mt-1" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {ALLOWED_PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm" htmlFor="task-status">Status</label>
          <select id="task-status" className="tf-input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ALLOWED_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><ErrorMessage message={error} /></div>
        <div className="flex gap-2 md:col-span-2">
          <button className="tf-btn tf-btn-primary text-sm" disabled={busy}>
            {busy ? "Saving…" : isNew ? "Create task" : "Save changes"}
          </button>
          <Link to="/tasks" className="tf-btn tf-btn-ghost text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
