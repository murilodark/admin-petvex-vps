import React from 'react';
import { LoginForm } from '../../modules/auth/components/LoginForm';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div id="login-page" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 w-full">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center" id="login-header-group">
        <div className="text-teal-600 font-extrabold text-4xl tracking-tighter uppercase mb-2">
          PETVEX
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] mb-4">
          Global Admin
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase" id="login-title">
          Controle de Acesso
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" id="login-card-container">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-[4px] sm:px-10 border-t-4 border-t-teal-600">
          <LoginForm onSuccess={onSuccess} />
        </div>
      </div>
      
      <div className="mt-8 text-center text-[10px] font-mono uppercase tracking-wider text-slate-400" id="login-footer">
        &copy; {currentYear} PETVEX SAAS PLATFORM. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
};

export default LoginPage;
