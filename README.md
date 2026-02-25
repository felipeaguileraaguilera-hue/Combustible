# ⛽ Combustible — Aceites Tapia SL

Sistema de control de gasóleo para la gestión de depósitos de combustible.

**Stack:** React 18 + Vite + Tailwind CSS + Supabase.

---

## 🚀 Despliegue

Consulta la **Guía de Despliegue** (documento Word incluido) para instrucciones detalladas paso a paso, sin necesidad de usar terminal.

**Resumen rápido de los 6 pasos:**

1. Crear proyecto en [Supabase](https://supabase.com) (gratis)
2. Pegar `supabase/schema.sql` en el SQL Editor de Supabase → Run
3. Desactivar "Confirm email" en Authentication → Providers → Email
4. Anotar Project URL y anon key desde Settings → API
5. Subir este repositorio a GitHub, configurar secretos y activar Pages
6. Crear usuario admin en Authentication → Add User

---

## 📁 Estructura

```
├── src/
│   ├── components/     → AppLayout, UI, Icons
│   ├── lib/            → auth, database, supabase, utils
│   ├── pages/          → Login, Dashboard, Entradas, Salidas, Usuarios, Historial
│   └── styles/         → CSS global + Tailwind
├── supabase/
│   ├── schema.sql      → Tablas, RLS, triggers (copiar y pegar en Supabase)
│   └── seed.sql        → Datos iniciales del admin
├── .github/workflows/  → Despliegue automático a GitHub Pages
└── public/             → PWA manifest e icono
```

---

## 📱 Instalación en móvil

Abre la URL en Chrome/Safari → menú → "Añadir a pantalla de inicio"
