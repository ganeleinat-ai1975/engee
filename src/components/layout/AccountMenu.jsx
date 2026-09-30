import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User as UserIcon, Settings } from "lucide-react";
import { useLanguage, t } from "@/components/LanguageProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AccountMenu({ user, onLogout }) {
  const { language } = useLanguage();
  const icon = <UserIcon className="w-5 h-5 text-main" strokeWidth={1.25} />;
  if (!user) {
    return <button onClick={() => base44.auth.redirectToLogin()} aria-label={t("login", language)} className="p-2">{icon}</button>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={t("profile", language)} className="p-2">{icon}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-none bg-background">
        <div className="px-3 py-2 border-b hairline">
          <p className="text-sm text-main">{user.full_name}</p>
          <p className="text-xs text-subtle">{user.email}</p>
        </div>
        <DropdownMenuItem asChild><Link to="/Profile">{t("profile", language)}</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/Orders">{t("orders", language)}</Link></DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild><Link to="/Admin"><Settings className="w-4 h-4 me-2" />{t("admin", language)}</Link></DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onLogout}>{t("logout", language)}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}