import { useMemo, useState } from "react";
import "./App.css";

const defaultState = {
  user: { name: "Jhan Valbuena", email: "jhan.valbuena@hometask.com", lang: "Español" },
  tasks: [
    { id: 1, name: "Limpiar el jardín frontal", assign: "Jhan", date: "", time: "14:00", cat: "exterior", prio: "high", status: "pending", desc: "Barrer hojas, podar arbustos y regar plantas.", notes: ["Recordar usar guantes"] },
    { id: 2, name: "Pagar factura de luz", assign: "Eduin", date: "", time: "", cat: "pagos", prio: "high", status: "done", desc: "Pagar antes del vencimiento.", notes: [] },
    { id: 3, name: "Organizar despensa", assign: "Elena", date: "", time: "", cat: "interior", prio: "med", status: "process", desc: "Revisar fechas de vencimiento.", notes: [] },
  ],
  members: ["Eduin Valbuena", "Elena Ruiz", "Mateo Valbuena", "Sofía Ruiz"],
  notifs: [
    { id: 1, title: "Nueva tarea asignada", sub: "Limpiar el jardín frontal", read: false },
    { id: 2, title: "Eduin completó tarea", sub: "Pagar factura de luz", read: false },
  ],
};

const STATUS = { pending: "Pendiente", process: "En proceso", done: "Completada" };

function App() {
  const [view, setView] = useState("onboard");
  const [state, setState] = useState(defaultState);
  const [toast, setToast] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", desc: "", assign: "Jhan", date: "", time: "", cat: "interior", prio: "med" });

  const currentTask = state.tasks.find((t) => t.id === currentTaskId);
  const unread = state.notifs.filter((n) => !n.read).length;
  const filteredTasks = useMemo(
    () =>
      state.tasks.filter((t) => {
        const byFilter = taskFilter === "all" || t.status === taskFilter;
        const q = search.toLowerCase();
        const bySearch = !q || t.name.toLowerCase().includes(q) || t.assign.toLowerCase().includes(q);
        return byFilter && bySearch;
      }),
    [state.tasks, taskFilter, search],
  );

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const go = (targetView) => setView(targetView);

  const createOrUpdateTask = () => {
    if (!form.name.trim()) return showToast("El título es obligatorio");
    if (currentTaskId) {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === currentTaskId ? { ...t, ...form, name: form.name.trim() } : t)),
      }));
      showToast("Tarea actualizada");
    } else {
      const nextId = Math.max(...state.tasks.map((t) => t.id), 0) + 1;
      setState((prev) => ({
        ...prev,
        tasks: [{ ...form, id: nextId, status: "pending", notes: [] }, ...prev.tasks],
        notifs: [{ id: Date.now(), title: "Nueva tarea creada", sub: form.name.trim(), read: false }, ...prev.notifs],
      }));
      showToast("Tarea creada");
    }
    setView("tasks");
    setCurrentTaskId(null);
    setForm({ name: "", desc: "", assign: "Jhan", date: "", time: "", cat: "interior", prio: "med" });
  };

  const openNewTask = () => {
    setCurrentTaskId(null);
    setForm({ name: "", desc: "", assign: "Jhan", date: "", time: "", cat: "interior", prio: "med" });
    go("new-task");
  };

  const openEditTask = (task) => {
    setCurrentTaskId(task.id);
    setForm({ name: task.name, desc: task.desc, assign: task.assign, date: task.date, time: task.time, cat: task.cat, prio: task.prio });
    go("new-task");
  };

  const cycleStatus = (id) => {
    const cycle = ["pending", "process", "done"];
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status: cycle[(cycle.indexOf(t.status) + 1) % cycle.length] } : t)),
    }));
  };

  const dashboardCount = {
    pending: state.tasks.filter((t) => t.status === "pending").length,
    process: state.tasks.filter((t) => t.status === "process").length,
    done: state.tasks.filter((t) => t.status === "done").length,
  };

  const viewContent = {
    onboard: (
      <div className="screen center">
        <h1>Bienvenido a HomeTask</h1>
        <p>La forma más simple de organizar las tareas del hogar en familia.</p>
        <button className="btn-o" onClick={() => go("login")}>Comenzar</button>
        <button className="btn-ol" onClick={() => go("login")}>Ya tengo cuenta</button>
      </div>
    ),
    login: (
      <div className="screen">
        <h2>Iniciar sesión</h2>
        <input className="fi" placeholder="Correo electrónico" />
        <input className="fi" type="password" placeholder="Contraseña" />
        <button className="btn-o" onClick={() => go("dashboard")}>Entrar</button>
        <button className="link" onClick={() => go("registro")}>Crear cuenta</button>
      </div>
    ),
    registro: (
      <div className="screen">
        <Top title="Crear cuenta" onBack={() => go("login")} />
        <input className="fi" placeholder="Nombre completo" />
        <input className="fi" placeholder="Correo electrónico" />
        <input className="fi" type="password" placeholder="Contraseña" />
        <button className="btn-o" onClick={() => go("dashboard")}>Registrarme</button>
      </div>
    ),
    dashboard: (
      <div className="screen">
        <Top title="HomeTask" right={<button className="tb-icon" onClick={() => go("notif")}>🔔{unread > 0 ? "•" : ""}</button>} />
        <h2>Hola, {state.user.name.split(" ")[0]}!</h2>
        <div className="stats">
          <Stat label="Pendientes" value={dashboardCount.pending} />
          <Stat label="Proceso" value={dashboardCount.process} />
          <Stat label="Hechas" value={dashboardCount.done} />
        </div>
        <div className="sh"><h3>Mis tareas</h3><button className="link" onClick={() => go("tasks")}>Ver todo</button></div>
        {state.tasks.slice(0, 4).map((t) => <TaskCard key={t.id} t={t} onOpen={() => { setCurrentTaskId(t.id); go("detail"); }} />)}
        <button className="fab" onClick={openNewTask}>+</button>
        <Nav go={go} active="dashboard" />
      </div>
    ),
    tasks: (
      <div className="screen">
        <Top title="Tareas" onBack={() => go("dashboard")} />
        <input className="fi" placeholder="Buscar tarea..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ftabs">
          {["all", "pending", "process", "done"].map((f) => (
            <button key={f} className={`ftab ${taskFilter === f ? "act" : ""}`} onClick={() => setTaskFilter(f)}>
              {f === "all" ? "Todos" : STATUS[f]}
            </button>
          ))}
        </div>
        <div className="list">
          {filteredTasks.map((t) => (
            <TaskRow key={t.id} t={t} onOpen={() => { setCurrentTaskId(t.id); go("detail"); }} onCycle={() => cycleStatus(t.id)} />
          ))}
        </div>
        <button className="fab" onClick={openNewTask}>+</button>
        <Nav go={go} active="tasks" />
      </div>
    ),
    "new-task": (
      <div className="screen">
        <Top title={currentTaskId ? "Editar tarea" : "Nueva tarea"} onBack={() => go("tasks")} />
        <input className="fi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Título de la tarea" />
        <textarea className="fi" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Descripción" />
        <select className="fi" value={form.assign} onChange={(e) => setForm({ ...form, assign: e.target.value })}>
          <option>Jhan</option><option>Eduin</option><option>Elena</option><option>Mateo</option><option>Sofía</option>
        </select>
        <div className="two">
          <input className="fi" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="fi" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
        <button className="btn-o" onClick={createOrUpdateTask}>Guardar</button>
      </div>
    ),
    detail: currentTask && (
      <div className="screen">
        <Top title="Detalle" onBack={() => go("tasks")} right={<button className="tb-icon" onClick={() => openEditTask(currentTask)}>✏️</button>} />
        <h2>{currentTask.name}</h2>
        <p>{currentTask.desc || "Sin descripción"}</p>
        <div className="chip">{STATUS[currentTask.status]}</div>
        <p>Asignado a: {currentTask.assign}</p>
        <p>Fecha: {currentTask.date || "Sin fecha"} {currentTask.time}</p>
        <button className="btn-ol" onClick={() => cycleStatus(currentTask.id)}>Cambiar estado</button>
      </div>
    ),
    notif: (
      <div className="screen">
        <Top title="Notificaciones" onBack={() => go("dashboard")} />
        {state.notifs.map((n) => (
          <div key={n.id} className="card">
            <strong>{n.title}</strong>
            <p>{n.sub}</p>
          </div>
        ))}
      </div>
    ),
    miembros: (
      <div className="screen">
        <Top title="Miembros" onBack={() => go("dashboard")} />
        {state.members.map((m) => <div className="card" key={m}>{m}</div>)}
        <Nav go={go} active="miembros" />
      </div>
    ),
    reportes: (
      <div className="screen">
        <Top title="Reportes" onBack={() => go("perfil")} />
        <h2>{Math.round((dashboardCount.done / Math.max(1, state.tasks.length)) * 100)}%</h2>
        <p>Porcentaje de tareas completadas</p>
      </div>
    ),
    perfil: (
      <div className="screen">
        <Top title="Perfil" onBack={() => go("dashboard")} />
        <div className="card"><strong>{state.user.name}</strong><p>{state.user.email}</p></div>
        <button className="btn-ol" onClick={() => go("idioma")}>Idioma</button>
        <button className="btn-ol" onClick={() => go("reportes")}>Reportes</button>
        <button className="btn-ol" onClick={() => go("miembros")}>Miembros</button>
        <button className="btn-o" onClick={() => go("onboard")}>Cerrar sesión</button>
        <Nav go={go} active="perfil" />
      </div>
    ),
    idioma: (
      <div className="screen">
        <Top title="Idioma" onBack={() => go("perfil")} />
        {["Español", "English", "Français", "Português"].map((lang) => (
          <button key={lang} className={`lang-opt ${state.user.lang === lang ? "sel" : ""}`} onClick={() => setState({ ...state, user: { ...state.user, lang } })}>
            {lang}
          </button>
        ))}
      </div>
    ),
  };

  return (
    <div className="app-bg">
      <div className="phone">
        {toast && <div className="toast show">{toast}</div>}
        {viewContent[view]}
      </div>
    </div>
  );
}

function Top({ title, onBack, right }) {
  return (
    <div className="topbar">
      {onBack ? <button className="back-btn" onClick={onBack}>←</button> : <div />}
      <span className="tb-brand">{title}</span>
      {right || <div style={{ width: 32 }} />}
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="sc"><div className="sl">{label}</div><div className="sn">{value}</div></div>;
}

function TaskCard({ t, onOpen }) {
  return (
    <button className="tc" onClick={onOpen}>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div className="tn">{t.name}</div>
        <div className="tsb">{t.assign}</div>
      </div>
      <span className="bdg">{STATUS[t.status]}</span>
    </button>
  );
}

function TaskRow({ t, onOpen, onCycle }) {
  return (
    <div className="tli" onClick={onOpen}>
      <button className="cc" onClick={(e) => { e.stopPropagation(); onCycle(); }}>✓</button>
      <div style={{ flex: 1 }}>
        <div className="tln">{t.name}</div>
        <div className="tsb">{t.assign} {t.time ? `• ${t.time}` : ""}</div>
      </div>
      <span className="bdg">{STATUS[t.status]}</span>
    </div>
  );
}

function Nav({ go, active }) {
  return (
    <nav className="bnav">
      <button className={`ni ${active === "dashboard" ? "act" : ""}`} onClick={() => go("dashboard")}>Inicio</button>
      <button className={`ni ${active === "tasks" ? "act" : ""}`} onClick={() => go("tasks")}>Tareas</button>
      <button className={`ni ${active === "miembros" ? "act" : ""}`} onClick={() => go("miembros")}>Miembros</button>
      <button className={`ni ${active === "perfil" ? "act" : ""}`} onClick={() => go("perfil")}>Perfil</button>
    </nav>
  );
}

export default App;
