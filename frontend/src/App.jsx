import { useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${API_BASE.replace(/\/$/, "")}/generate`;

const requirements = [
  { id: "len", label: "12 caracteres" },
  { id: "upper", label: "Mayusculas" },
  { id: "lower", label: "Minusculas" },
  { id: "digit", label: "Numeros" },
  { id: "symbol", label: "Simbolos" },
];

function evaluatePassword(value) {
  return {
    len: value.length >= 12,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

function RequirementItem({ label, ok }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/40 px-4 py-3">
      <span className="text-sm text-slate-200">{label}</span>
      <span className={`text-xs font-semibold ${ok ? "text-emerald-300" : "text-rose-300"}`}>
        {ok ? "OK" : "NO"}
      </span>
    </div>
  );
}

function PasswordCard({ value }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
      <p className="text-sm text-slate-400">Sugerencia</p>
      <p className="mt-2 break-words text-lg font-semibold text-slate-100">
        {value || "---"}
      </p>
    </div>
  );
}

export default function App() {
  const [seed, setSeed] = useState("");
  const [generated, setGenerated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState("");

  const evaluation = useMemo(() => evaluatePassword(candidate), [candidate]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: seed }),
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();
      setGenerated(Array.isArray(data.passwords) ? data.passwords : []);
    } catch (err) {
      setError("No se pudieron generar las contraseñas.");
      setGenerated([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-100">
      <div className="px-6 py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 font-['Space_Grotesk']">
          <header className="space-y-4">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Generador y evaluador de contraseñas seguras
            </h1>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-6">
              <h2 className="text-lg font-semibold text-white">Generador de contraseñas</h2>
              <p className="mt-2 text-sm text-slate-300">
                Ingresa palabras base o frases para crear 3 sugerencias seguras.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <input
                  value={seed}
                  onChange={(event) => setSeed(event.target.value)}
                  placeholder="Ej: cielo, bosque, aurora"
                  className="flex-1 rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="rounded-lg bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Generando..." : "Generar"}
                </button>
              </div>
              {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <PasswordCard key={index} value={generated[index]} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-6">
              <h2 className="text-lg font-semibold text-white">
                Evaluador en vivo
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Escribe una contraseña y revisa los requisitos.
              </p>
              <input
                value={candidate}
                onChange={(event) => setCandidate(event.target.value)}
                placeholder="Tu contraseña"
                className="mt-6 w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
              />

              <div className="mt-6 grid gap-3">
                {requirements.map((item) => (
                  <RequirementItem
                    key={item.id}
                    label={item.label}
                    ok={evaluation[item.id]}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
