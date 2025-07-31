import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, User, ProfileData } from '../../services/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;
  profileData: ProfileData | null = null;
  private userSubscription!: Subscription;

  editProfileForm!: FormGroup;
  changePasswordForm!: FormGroup;

  showEditProfileModal = false;
  showChangePasswordModal = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.userSubscription = this.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileData = this.authService.getProfileDataForUser(user);
        this.initializeForms();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  initializeForms(): void {
    if (!this.currentUser) return;

    this.editProfileForm = this.fb.group({
      fullName: [this.currentUser.fullName, Validators.required],
      title: [this.currentUser.title || '', Validators.required],
      bio: [this.currentUser.bio || '']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  openModal(modal: 'editProfile' | 'changePassword'): void {
    if (modal === 'editProfile') this.showEditProfileModal = true;
    if (modal === 'changePassword') this.showChangePasswordModal = true;
  }

  closeModals(): void {
    this.showEditProfileModal = false;
    this.showChangePasswordModal = false;
  }

  onUpdateProfile(): void {
    if (this.editProfileForm.invalid) return;
    this.authService.updateProfile(this.editProfileForm.value);
    this.closeModals();
  }

  async onUpdatePassword(): Promise<void> {
    if (this.changePasswordForm.invalid) return;
    try {
      const { currentPassword, newPassword } = this.changePasswordForm.value;
      await this.authService.updatePassword(currentPassword, newPassword);
      this.closeModals();
    } catch (error: any) {
      this.changePasswordForm.get('currentPassword')?.setErrors({ incorrect: true });
      console.error(error.message);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.authService.updateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
}