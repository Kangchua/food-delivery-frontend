import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Menu, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import useTranslation from '@/hooks/useTranslation';
import { NotificationBell } from '@/components/common/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "shipper":
        return "/shipper";
      default:
        return "/";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to={getDashboardLink()} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-primary">
            <span className="text-xl font-bold text-primary-foreground">
              🍜
            </span>
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:inline">
            FoodGo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {user?.role === "admin" ? (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.dashboard") ?? "Bảng điều khiển"}
              </Link>
              <Link
                to="/admin/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.orders")}
              </Link>
              <Link
                to="/admin/products"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.products")}
              </Link>
              <Link
                to="/admin/categories"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.categories")}
              </Link>
              <Link
                to="/admin/users"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.users") ?? "Khách hàng"}
              </Link>
              <Link
                to="/admin/reviews"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.reviews") ?? "Đánh giá"}
              </Link>
              <Link
                to="/admin/reports"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("admin.reports") ?? "Báo cáo"}
              </Link>
            </>
          ) : user?.role === "customer" || !user ? (
            <>
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/menu"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("nav.menu")}
              </Link>
            </>
          ) : null}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => navigate("/menu")}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notification Bell - Authenticated only */}
          {isAuthenticated && <NotificationBell />}

          {/* Cart - Customer only */}
          {(!user || user.role === "customer") && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    {t("nav.dashboard") ?? "Bảng điều khiển"}
                  </DropdownMenuItem>
                )}
                {user?.role === "customer" && (
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    {t("nav.orders")}
                  </DropdownMenuItem>
                )}
                {user?.role === "customer" && (
                  <DropdownMenuItem onClick={() => navigate("/review")}>
                    <Star className="mr-2 h-4 w-4" /> Đánh giá của tôi
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="gradient-primary shadow-primary"
              onClick={() => navigate("/auth/login")}
            >
              {t("auth.login")}
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
