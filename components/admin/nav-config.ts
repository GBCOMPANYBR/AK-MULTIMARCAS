export interface AdminNavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/frota", label: "Frota" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/locacoes", label: "Locações" },
  { href: "/admin/financeiro", label: "Financeiro", adminOnly: true },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/usuarios", label: "Usuários", adminOnly: true },
];
