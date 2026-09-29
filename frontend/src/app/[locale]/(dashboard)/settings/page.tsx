"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import {
  User,
  Mail,
  Building2,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Key,
  Save,
  Crown,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const alert = useSweetAlert();

  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    company: "TechVentures Inc.",
    phone: "+1 (555) 123-4567",
    entityType: "small",
    citizenship: "US",
  });

  const updateProfile = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert.success(t("saved"), t("savedText"));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList variant="line" className="mb-6 overflow-x-auto no-scrollbar">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 me-1.5" />
            {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 me-1.5" />
            {t("tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 me-1.5" />
            {t("tabs.billing")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 me-1.5" />
            {t("tabs.security")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="border-b">
                <CardTitle>{t("profile.title")}</CardTitle>
                <CardDescription>{t("profile.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-2">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="inline h-4 w-4 me-1.5 text-muted-foreground" />
                      {t("profile.fullName")}
                    </label>
                    <Input
                      value={profile.fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProfile("fullName", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="inline h-4 w-4 me-1.5 text-muted-foreground" />
                      {t("profile.email")}
                    </label>
                    <Input
                      value={profile.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProfile("email", e.target.value)}
                      className="h-10"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Building2 className="inline h-4 w-4 me-1.5 text-muted-foreground" />
                      {t("profile.company")}
                    </label>
                    <Input
                      value={profile.company}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProfile("company", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Globe className="inline h-4 w-4 me-1.5 text-muted-foreground" />
                      {t("profile.phone")}
                    </label>
                    <Input
                      value={profile.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProfile("phone", e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Entity Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("profile.entityType")}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["micro", "small", "large"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateProfile("entityType", type)}
                        className={`rounded-xl border p-3 text-center transition-all text-sm ${
                          profile.entityType === type
                            ? "border-gold-500 bg-gold-500/5 text-foreground ring-1 ring-gold-500/30"
                            : "border-border hover:border-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {t(`profile.entities.${type}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} className="bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold">
                  <Save className="h-4 w-4 me-2" />
                  {t("profile.save")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="border-b">
                <CardTitle>{t("notifications.title")}</CardTitle>
                <CardDescription>{t("notifications.description")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {(["statusUpdates", "officeActions", "deadlines", "marketing"] as const).map((key) => (
                    <div key={key} className="flex items-center justify-between px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t(`notifications.items.${key}.title`)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t(`notifications.items.${key}.description`)}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked={key !== "marketing"} />
                        <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-gold-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Plan */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("billing.currentPlan")}</CardTitle>
                    <CardDescription>{t("billing.planDescription")}</CardDescription>
                  </div>
                  <Badge className="bg-gradient-gold text-brand-900 font-semibold text-sm px-3 py-1">
                    <Crown className="h-3.5 w-3.5 me-1" />
                    Pro
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">$99</span>
                  <span className="text-muted-foreground text-sm">{t("billing.perMonth")}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {["10 Patent Drafts / month", "Advanced Prior Art Analysis", "AI Claims Generation", "Priority Email Support"].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline">{t("billing.changePlan")}</Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive">
                    {t("billing.cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>{t("billing.paymentMethod")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 rounded-xl border border-border p-4">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-muted font-mono text-xs font-bold text-foreground">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">{t("billing.expires")} 12/2027</p>
                  </div>
                  <Button variant="ghost" size="sm">{t("billing.update")}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="border-b">
                <CardTitle>{t("security.password")}</CardTitle>
                <CardDescription>{t("security.passwordDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("security.currentPassword")}</label>
                  <Input type="password" className="h-10 max-w-md" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("security.newPassword")}</label>
                  <Input type="password" className="h-10 max-w-md" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("security.confirmPassword")}</label>
                  <Input type="password" className="h-10 max-w-md" placeholder="••••••••" />
                </div>
                <Button className="bg-gradient-gold text-brand-900 font-semibold hover:shadow-glow-gold">
                  <Key className="h-4 w-4 me-2" />
                  {t("security.updatePassword")}
                </Button>
              </CardContent>
            </Card>

            {/* 2FA */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("security.twoFactor")}</CardTitle>
                    <CardDescription>{t("security.twoFactorDescription")}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30">{t("security.enabled")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline">{t("security.manage2FA")}</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
