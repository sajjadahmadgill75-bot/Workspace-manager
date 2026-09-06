import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, SystemRole, Department } from '../../types/workspace';
import initialMockData from '../../mock/index';

export interface AuthState {
  activeUserId: string | null;
  users: User[];
}

const initialState: AuthState = {
  activeUserId: null,
  users: initialMockData.users,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActiveUser: (state, action: PayloadAction<string | null>) => {
      state.activeUserId = action.payload;
    },
    logoutUser: (state) => {
      state.activeUserId = null;
    },
    updateUserProfile: (
      state,
      action: PayloadAction<{
        userId: string;
        name?: string;
        email?: string;
        avatar?: string;
        systemRole?: SystemRole;
        jobTitle?: string;
        department?: Department;
      }>
    ) => {
      const user = state.users.find((u) => u.id === action.payload.userId);
      if (user) {
        if (action.payload.name) user.name = action.payload.name;
        if (action.payload.email) user.email = action.payload.email;
        if (action.payload.avatar) user.avatar = action.payload.avatar;
        if (action.payload.systemRole) user.systemRole = action.payload.systemRole;
        if (action.payload.jobTitle) user.jobTitle = action.payload.jobTitle;
        if (action.payload.department) user.department = action.payload.department;
      }
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    setAllUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
});

export const { setActiveUser, logoutUser, updateUserProfile, addUser, setAllUsers } = authSlice.actions;
export default authSlice.reducer;
