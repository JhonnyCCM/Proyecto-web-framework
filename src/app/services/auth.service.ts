import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

// --- INTERFACES ---
export interface User {
  id?: string;
  fullName: string;
  role: 'Admin' | 'Estudiante' | 'Instructor';
  email?: string;
  password?: string;
  avatar?: string; // URL o base64
  bio?: string;
  title?: string; // Título profesional
}

export interface ProfileData {
  skills: { name: string; level: number }[];
  stats: { courses: number; hours: number; certificates: number };
  activities: { icon: string; title: string; description: string; time: string }[];
  goals: { icon: string; text: string; status: 'completed' | 'in-progress' | 'pending' }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.createDemoUsers();
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  // --- MÉTODOS DE AUTENTICACIÓN ---

  loginWithCredentials(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => { // Simular delay de red
          const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find(u => u.email === email && u.password === password);

          if (user) {
            this.login(user);
            resolve(user);
          } else {
            reject(new Error('Credenciales incorrectas. Verifica tu email y contraseña.'));
          }
        }, 1000);
      } else {
        reject(new Error('No se puede iniciar sesión desde el servidor'));
      }
    });
  }
  
  login(user: User): void {
    const userToSave = { ...user };
    delete userToSave.password; // ¡Nunca guardar la contraseña en localStorage!

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(userToSave));
    }
    this.currentUserSubject.next(userToSave);
  }
  
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }
  
  register(newUser: User): Promise<User> {
    return new Promise((resolve, reject) => {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
          const existingUser = users.find(u => u.email === newUser.email);
          if (existingUser) {
            return reject(new Error('Este correo electrónico ya está registrado.'));
          }
          newUser.id = `user_${Date.now()}`;
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          this.login(newUser);
          resolve(newUser);
        }, 1000);
      } else {
        reject(new Error('El registro no está disponible en el servidor.'));
      }
    });
  }

  // --- MÉTODOS PARA EL PERFIL ---

  getProfileDataForUser(user: User): ProfileData {
    const profileTemplates: { [key: string]: ProfileData } = {
      Admin: {
        skills: [{ name: "Gestión de Sistemas", level: 95 }, { name: "Liderazgo", level: 85 }],
        stats: { courses: 25, hours: 320, certificates: 15 },
        activities: [{ icon: "👥", title: "Usuarios gestionados", description: "150+ usuarios activos", time: "hace 1 hora" }],
        goals: [{ icon: "🎯", text: "Optimizar rendimiento", status: "in-progress" }],
      },
      Estudiante: {
        skills: [{ name: "JavaScript", level: 70 }, { name: "HTML/CSS", level: 85 }, { name: "React", level: 60 }],
        stats: { courses: 8, hours: 156, certificates: 4 },
        activities: [{ icon: "🏆", title: "Certificado completado", description: "JavaScript Fundamentals", time: "hace 2 días" }],
        goals: [{ icon: "🎯", text: "Completar 3 cursos", status: "in-progress" }],
      },
      Instructor: {
        skills: [{ name: "Enseñanza", level: 95 }, { name: "JavaScript", level: 90 }],
        stats: { courses: 15, hours: 280, certificates: 12 },
        activities: [{ icon: "👨‍🏫", title: "Clase impartida", description: "Advanced JavaScript", time: "hace 2 horas" }],
        goals: [{ icon: "🎯", text: "Crear 2 cursos nuevos", status: "in-progress" }],
      }
    };
    return profileTemplates[user.role] || profileTemplates['Estudiante'];
  }

  updateProfile(updatedData: { fullName: string; title: string; bio: string; }): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.currentUserSubject.value;
      if (!currentUser) return;

      const updatedUser: User = {
        ...currentUser,
        fullName: updatedData.fullName,
        title: updatedData.title,
        bio: updatedData.bio,
      };

      this.updateUserInStorage(updatedUser);
      this.currentUserSubject.next(updatedUser);
    }
  }

  updateAvatar(base64Image: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.currentUserSubject.value;
      if (!currentUser) return;

      const updatedUser: User = { ...currentUser, avatar: base64Image };
      this.updateUserInStorage(updatedUser);
      this.currentUserSubject.next(updatedUser);
    }
  }

  updatePassword(currentPass: string, newPass: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isPlatformBrowser(this.platformId)) {
        const currentUser = this.currentUserSubject.value;
        if (!currentUser || !currentUser.id) {
          return reject(new Error("No hay usuario conectado."));
        }

        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const userInDb = users.find(u => u.id === currentUser.id);

        if (!userInDb || userInDb.password !== currentPass) {
          return reject(new Error("La contraseña actual es incorrecta."));
        }

        userInDb.password = newPass;
        this.updateUserInStorage(userInDb);
        resolve();
      } else {
        reject(new Error("No disponible en el servidor."));
      }
    });
  }

  private updateUserInStorage(updatedUser: User): void {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex > -1) {
      const userToUpdate = { ...users[userIndex], ...updatedUser };
      users[userIndex] = userToUpdate;
      localStorage.setItem('users', JSON.stringify(users));
    }
    const currentUserToSave = { ...updatedUser };
    delete currentUserToSave.password;
    localStorage.setItem('currentUser', JSON.stringify(currentUserToSave));
  }

  private createDemoUsers(): void {
    if (isPlatformBrowser(this.platformId)) {
        const existingUsers = localStorage.getItem("users");
        if (existingUsers) return;

        const demoUsers: User[] = [
            { id: "admin_demo", fullName: "Administrador Demo", email: "admin@courseconnect.com", password: "admin123", role: "Admin", avatar: 'https://i.pravatar.cc/150?u=admin', title: 'System Administrator', bio: 'Responsible for system-wide settings and user management.' },
            { id: "student_demo", fullName: "Estudiante Demo", email: "estudiante@courseconnect.com", password: "student123", role: "Estudiante", avatar: 'https://i.pravatar.cc/150?u=student', title: 'Lifelong Learner', bio: 'Eager to learn new technologies and improve my skills.' },
            { id: "instructor_demo", fullName: "Instructor Demo", email: "instructor@courseconnect.com", password: "instructor123", role: "Instructor", avatar: 'https://i.pravatar.cc/150?u=instructor', title: 'Software Engineer & Educator', bio: 'Passionate about sharing knowledge and building cool things.' },
        ];

        localStorage.setItem("users", JSON.stringify(demoUsers));
    }
  }
}