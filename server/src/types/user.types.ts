export type UserAccountStatus = "active" | "suspended" | "deleted";

// -------------------- DTOs --------------------

export interface PublicUserDTO {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: {
    date: string;
    time: string;
  };
}

export interface PrivateUserDTO extends PublicUserDTO {
  role: string;
  firstName: string;
  lastName: string;
  lastLogin: {
    date: string;
    time: string;
  };
}

export interface AdminUserDTO extends PrivateUserDTO {
  email: string;
  status: UserAccountStatus;
}

// -------------------- Other structures --------------------

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}
