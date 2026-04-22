import { useMemo, useState, useEffect } from "react";
import "./App.css";
import { authService, taskService } from "./services/api";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { useTasks } from "./hooks/useTasks";

const STATUS = { pending: "Pendiente", process: "En proceso", done: "Completada" };

function AppContent() {
  const { user, loading, login, register, logout } = useAuth();
  const { tasks, loadTasks, createTask, updateTask, changeTaskStatus, deleteTask } = useTasks();
  
  const [view, setView] = useState(user ? "dashboard" : "onboard");
  const [toast, setToast] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", desc: "", assign: user?.name || "Usuario", date: "", time: "", cat: "interior", prio: "med" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const go = (targetView) => setView(targetView);

  // Cargar tareas al montar el componente
  useEffect(() => {
    if (user) {
      loadTasks().catch(err => showToast(`Error: ${err.message}`));
    }
  }, [user, loadTasks]);

  // Cambiar vista según autenticación
  useEffect(() => {
    if (loading) return;
    if (!user && view !== "onboard" && view !== "login" && view !== "registro") {
      setView("onboard");
    }
  }, [user, loading, view]);

  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const unread = notifs.filter((n) => !n.read).length;
  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const byFilter = taskFilter === "all" || t.status === taskFilter;
        const q = search.toLowerCase();
        const bySearch = !q || t.name.toLowerCase().includes(q) || (t.assign && t.assign.toLowerCase().includes(q));
        return byFilter && bySearch;
      }),
    [tasks, taskFilter, search],
  );

  const handleLogin = async (email, password) => {
    try {
      setIsSubmitting(true);
      await login(email, password);
      showToast("¡Bienvenido!");
      setView("dashboard");
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      setIsSubmitting(true);
      await register(email, password, name);
      showToast("¡Cuenta creada! Bienvenido");
      setView("dashboard");
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Sesión cerrada");
      setView("onboard");
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const createOrUpdateTask = async () => {
    if (!form.name.trim()) return showToast("El título es obligatorio");
    
    try {
      setIsSubmitting(true);
      if (currentTaskId) {
        await updateTask(currentTaskId, form);
        showToast("Tarea actualizada");
      } else {
        await createTask(form);
        showToast("Tarea creada");
      }
      setView("tasks");
      setCurrentTaskId(null);
      setForm({ name: "", desc: "", assign: user?.name || "Usuario", date: "", time: "", cat: "interior", prio: "med" });
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewTask = () => {
    setCurrentTaskId(null);
    setForm({ name: "", desc: "", assign: user?.name || "Usuario", date: "", time: "", cat: "interior", prio: "med" });
    go("new-task");
  };

  const openEditTask = (task) => {
    setCurrentTaskId(task.id);
    setForm({ name: task.name, desc: task.desc, assign: task.assign, date: task.date, time: task.time, cat: task.cat, prio: task.prio });
    go("new-task");
  };

  const cycleStatus = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const cycle = ["pending", "process", "done"];
      const newStatus = cycle[(cycle.indexOf(task.status) + 1) % cycle.length];
      await changeTaskStatus(id, newStatus);
      showToast("Estado actualizado");
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const dashboardCount = {
    pending: tasks.filter((t) => t.status === "pending").length,
    process: tasks.filter((t) => t.status === "process").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const viewContent = {
    onboard: (
      <div className="screen center">
        <h1>Bienvenido a HomeTask</h1>
        <p>La forma más simple de organizar las tareas del hogar en familia.</p>
        <button className="btn-o" onClick={() => go("registro")}>Crear cuenta</button>
        <button className="btn-ol" onClick={() => go("login")}>Iniciar sesión</button>
      </div>
    ),
    login: (
      <div className="screen">
        <h2>Iniciar sesión</h2>
        <input 
          className="fi" 
          placeholder="Correo electrónico" 
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <input 
          className="fi" 
          type="password" 
          placeholder="Contraseña"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          disabled={isSubmitting}
        />
        <button 
          className="btn-o" 
          onClick={() => handleLogin(loginEmail, loginPassword)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cargando..." : "Entrar"}
        </button>
        <button className="link" onClick={() => go("registro")}>Crear cuenta</button>
      </div>
    ),
    registro: (
      <div className="screen">
        <Top title="Crear cuenta" onBack={() => go("login")} />
        <input 
          className="fi" 
          placeholder="Nombre completo" 
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          disabled={isSubmitting}
        />
        <input 
          className="fi" 
          placeholder="Correo electrónico" 
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          disabled={isSubmitting}
        />
        <input 
          className="fi" 
          type="password" 
          placeholder="Contraseña"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          disabled={isSubmitting}
        />
        <button 
          className="btn-o" 
          onClick={() => handleRegister(registerEmail, registerPassword, registerName)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cargando..." : "Registrarme"}
        </button>
      </div>
    ),
    dashboard: (
      <div className="screen">
        <Top title="HomeTask" right={<button className="tb-icon" onClick={() => go("notif")}>🔔{unread > 0 ? "•" : ""}</button>} />
        <h2>Hola, {user?.name?.split(" ")[0] || "Usuario"}!</h2>
        <div className="stats">
          <Stat label="Pendientes" value={dashboardCount.pending} />
          <Stat label="Proceso" value={dashboardCount.process} />
          <Stat label="Hechas" value={dashboardCount.done} />
        </div>
        <div className="sh"><h3>Mis tareas</h3><button className="link" onClick={() => go("tasks")}>Ver todo</button></div>
        {tasks.slice(0, 4).map((t) => <TaskCard key={t.id} t={t} onOpen={() => { setCurrentTaskId(t.id); go("detail"); }} />)}
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
        {notifs.map((n) => (
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
        {members.map((m) => <div className="card" key={m}>{m}</div>)}
        <Nav go={go} active="miembros" />
      </div>
    ),
    reportes: (
      <div className="screen">
        <Top title="Reportes" onBack={() => go("perfil")} />
        <h2>{Math.round((dashboardCount.done / Math.max(1, tasks.length)) * 100)}%</h2>
        <p>Porcentaje de tareas completadas</p>
      </div>
    ),
    perfil: (
      <div className="screen">
        <Top title="Perfil" onBack={() => go("dashboard")} />
        <div className="card"><strong>{user?.name}</strong><p>{user?.email}</p></div>
        <button className="btn-ol" onClick={() => go("idioma")}>Idioma</button>
        <button className="btn-ol" onClick={() => go("reportes")}>Reportes</button>
        <button className="btn-ol" onClick={() => go("miembros")}>Miembros</button>
        <button className="btn-o" onClick={handleLogout}>Cerrar sesión</button>
        <Nav go={go} active="perfil" />
      </div>
    ),
    idioma: (
      <div className="screen">
        <Top title="Idioma" onBack={() => go("perfil")} />
        {["Español", "English", "Français", "Português"].map((lang) => (
          <button key={lang} className="lang-opt" onClick={() => {}}>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
