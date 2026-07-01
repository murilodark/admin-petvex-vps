import React from 'react';
import { ProfileCard } from '../../modules/profile/components/ProfileCard';

export const ProfilePage: React.FC = () => {
  return (
    <div id="profile-page" className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200" id="profile-massive-header">
        <div>
          <div id="massive-title" className="text-[54px] sm:text-[72px] lg:text-[84px] leading-[0.9] font-black tracking-tighter uppercase text-slate-900">
            PERFIL<br/>USUÁRIO
          </div>
          <p id="massive-subtitle" className="text-xs text-slate-500 mt-4 max-w-xl font-medium leading-relaxed">
            Confira abaixo as informações do administrador da plataforma obtidas diretamente da API administrativa com Sanctum Bearer Token.
          </p>
        </div>
        <div className="text-left md:text-right" id="profile-route-indicator">
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-2 font-black">
            Active Endpoint Tracker
          </div>
          <div className="flex items-center md:justify-end font-mono text-xs text-teal-700 bg-teal-50/70 border border-teal-100 px-3.5 py-1.5 rounded-[4px] font-bold">
            GET /api/v1/admin/auth/me : ACTIVE
          </div>
        </div>
      </div>

      <ProfileCard />
    </div>
  );
};

export default ProfilePage;
