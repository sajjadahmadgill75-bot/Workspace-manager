'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store';
import { setActiveUser, addUser } from '../../store/slices/authSlice';
import { Eye, EyeOff, UserPlus, LogIn, Briefcase, KeyRound } from 'lucide-react';
import { SystemRole, User } from '../../types/workspace';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [systemRole, setSystemRole] = useState<SystemRole>('member');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    const matchedUser = users.find((u) => u.email === email && u.password === password);
    if (matchedUser) {
      dispatch(setActiveUser(matchedUser.id));
      router.replace('/');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('Please fill in all required fields.');
      return;
    }

    if (users.some((u) => u.email === email)) {
      setError('Email is already registered.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      password,
      systemRole,
      jobTitle: jobTitle || 'Team Member',
      department: 'Engineering', // Default for now
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    };

    dispatch(addUser(newUser));
    dispatch(setActiveUser(newUser.id));
    router.replace('/');
  };

  const autofillCredentials = (userEmail: string, userPass: string) => {
    setActiveTab('signin');
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Workspace Manager
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to your account or create a new one
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow-2xl border border-slate-800 sm:rounded-3xl sm:px-10">
          
          {/* Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-xl mb-8">
            <button
              onClick={() => { setActiveTab('signin'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-700 bg-slate-800/50 rounded-xl shadow-sm placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-700 bg-slate-800/50 rounded-xl shadow-sm placeholder-slate-500 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Developer"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">System Role</label>
                  <select
                    value={systemRole}
                    onChange={(e) => setSystemRole(e.target.value as SystemRole)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-700 bg-slate-800/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Demo Login Selector */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-500 font-bold tracking-wider uppercase flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Quick Test Accounts
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {users.slice(0, 4).map((user) => (
              <button
                key={user.id}
                onClick={() => user.password && autofillCredentials(user.email, user.password)}
                className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-indigo-500/50 transition group text-left"
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">{user.systemRole}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
