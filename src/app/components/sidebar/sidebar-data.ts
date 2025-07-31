export interface MenuItem {
  id: string;
  text: string;
  icon: string;
  url: string;
  section: 'main' | 'user' | 'admin';
  roles: Array<'Admin' | 'Estudiante' | 'Instructor'>;
  badge?: string;
  children?: MenuItem[];
}

export const SIDEBAR_MENU: MenuItem[] = [
  // ==================== Navegación Principal ====================
  {
    id: "home",
    text: "Inicio",
    icon: "🏠",
    url: "/",
    section: "main",
    roles: ["Admin", "Estudiante", "Instructor"],
  },
  {
    id: "dashboard",
    text: "Panel",
    icon: "📊",
    url: "/panel",
    section: "main",
    roles: ["Admin", "Instructor", "Estudiante"],
  },
  {
    id: "courses",
    text: "Cursos",
    icon: "📚",
    url: "/courses",
    section: "main",
    roles: ["Admin", "Estudiante", "Instructor"],
  },
  {
  id: "classroom",
  text: "Aula Virtual",
  icon: "📝",
  url: "/aula/course_1", // <--- URL específica con un ID de ejemplo
  section: "main",
  roles: [ "Estudiante", "Instructor"],
},
  {
    id: "schedule",
    text: "Cronograma",
    icon: "📅",
    url: "/cronograma",
    section: "main",
    roles: ["Admin", "Estudiante", "Instructor"],
  },

  // ==================== Sección de Usuario ====================
  {
    id: "profile",
    text: "Mi Perfil",
    icon: "👤",
    url: "/profile",
    section: "user",
    roles: ["Admin", "Estudiante", "Instructor"],
  },
  {
    id: "settings",
    text: "Configuración",
    icon: "⚙️",
    url: "/settings",
    section: "user",
    roles: ["Admin", "Estudiante", "Instructor"],
  },

  // ==================== Sección Administrativa ====================
  {
    id: "users",
    text: "Usuarios",
    icon: "👥",
    url: "/users",
    section: "admin",
    roles: ["Admin"],
    // Submenú para usuarios
    children: [
      {
        id: "students",
        text: "Estudiantes",
        icon: "🎓",
        url: "/users/students",
        section: "admin",
        roles: ["Admin"],
      },
      {
        id: "instructors",
        text: "Instructores",
        icon: "👨‍🏫",
        url: "/users/instructors",
        section: "admin",
        roles: ["Admin"],
      },
    ],
  },
];
