"use client";

import { useEffect, useMemo, useState, FormEvent, useRef } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
  FormLayout,
  FormSection,
  FormField,
  Input,
  Textarea,
  Switch,
} from "@/components/admin/ui/FormLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { locales, defaultLocale } from "@/i18n/config";
import type { SiteSettings, SettingsLink } from "@/types/settings.types";

interface LanguageOption {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

const buildLocalized = (value: string = "") =>
  locales.reduce<Record<string, string>>((acc, code) => {
    acc[code] = value;
    return acc;
  }, {});

const createEmptySettings = (): SiteSettings => ({
  site: {
    name: buildLocalized(""),
    description: buildLocalized(""),
    url: "",
  },
  menuLinks: [],
  contact: {
    email: "",
    phone: "",
    address: "",
  },
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    telegram: "",
    tiktok: "",
    whatsapp: "",
    twitter: "",
    linkedin: "",
  },
  footer: {
    copyright: buildLocalized(""),
    poweredByLabel: "Powered by:",
    poweredByUrl: "",
    poweredByLogoUrl: "/assets/icons/coresoft.svg",
  },
  seo: {
    defaultTitle: buildLocalized(""),
    defaultDescription: buildLocalized(""),
    ogTitle: buildLocalized(""),
    ogDescription: buildLocalized(""),
    ogImageUrl: "",
  },
  analytics: {
    gaId: "",
    gtmId: "",
  },
  localization: {
    defaultLocale,
    supportedLocales: [...locales],
    timezone: "Asia/Baku",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
  },
  api: {
    cacheEnabled: false,
    cacheTtl: 300,
    rateLimitPerMinute: 100,
  },
});

const ensureLocalized = (
  value: Record<string, string> | undefined,
  codes: string[],
) =>
  codes.reduce<Record<string, string>>((acc, code) => {
    acc[code] = value?.[code] ?? "";
    return acc;
  }, {});

const createLink = (codes: string[]): SettingsLink => ({
  id:
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `link-${Date.now()}`),
  label: ensureLocalized({}, codes),
  url: "",
});

export default function SettingsPage() {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(createEmptySettings);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOgUploading, setIsOgUploading] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{
    type: "success" | "error";
    title: string;
    description?: string;
  } | null>(null);
  const ogImageInputRef = useRef<HTMLInputElement | null>(null);
  const saveNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const languageCodes = useMemo(
    () =>
      languages.length
        ? languages.map((lang) => lang.code)
        : [...locales],
    [languages],
  );

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch("/api/languages?active=1");
        const data = await response.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const sorted = [...data.data].sort(
            (a: LanguageOption, b: LanguageOption) =>
              (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
          );
          setLanguages(sorted);
          return;
        }
      } catch {
        // ignore
      }
      setLanguages(
        locales.map((code, index) => ({
          id: code,
          code,
          name: code.toUpperCase(),
          sortOrder: index,
          isActive: true,
        })),
      );
    };

    loadLanguages();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (data.success && data.data) {
          const codes = languageCodes;
          const next = data.data as SiteSettings;
          const normalized: SiteSettings = {
            ...createEmptySettings(),
            ...next,
            site: {
              ...createEmptySettings().site,
              ...next.site,
              name: ensureLocalized(next.site?.name, codes),
              description: ensureLocalized(next.site?.description, codes),
            },
            footer: {
              ...createEmptySettings().footer,
              ...next.footer,
              copyright: ensureLocalized(next.footer?.copyright, codes),
            },
            seo: {
              ...createEmptySettings().seo,
              ...next.seo,
              defaultTitle: ensureLocalized(next.seo?.defaultTitle, codes),
              defaultDescription: ensureLocalized(
                next.seo?.defaultDescription,
                codes,
              ),
              ogTitle: ensureLocalized(next.seo?.ogTitle, codes),
              ogDescription: ensureLocalized(next.seo?.ogDescription, codes),
              ogImageUrl: next.seo?.ogImageUrl || "",
            },
            menuLinks: Array.isArray(next.menuLinks)
              ? next.menuLinks.map((link) => ({
                  ...link,
                  id: link.id || createLink(codes).id,
                  label: ensureLocalized(link.label, codes),
                  url: link.url || "",
                }))
              : [],
            localization: {
              ...createEmptySettings().localization,
              ...next.localization,
              supportedLocales:
                next.localization?.supportedLocales?.length
                  ? next.localization.supportedLocales
                  : [...codes],
            },
          };
          setSettings(normalized);
        } else {
          error("Failed to load settings", data.error);
        }
      } catch (err) {
        error("Failed to load settings", "Please try again later");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [error, languageCodes]);

  useEffect(() => {
    return () => {
      if (saveNoticeTimerRef.current) {
        clearTimeout(saveNoticeTimerRef.current);
      }
    };
  }, []);

  const showSaveNotice = (
    type: "success" | "error",
    title: string,
    description?: string,
  ) => {
    setSaveNotice({ type, title, description });
    if (saveNoticeTimerRef.current) {
      clearTimeout(saveNoticeTimerRef.current);
    }
    saveNoticeTimerRef.current = setTimeout(() => {
      setSaveNotice(null);
    }, 4000);
  };

  const updateLocalized = (
    section: keyof SiteSettings,
    key: string,
    locale: string,
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [key]: {
          ...(prev[section] as Record<string, any>)[key],
          [locale]: value,
        },
      },
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        success("Settings saved", "Your changes are live.");
        showSaveNotice("success", "Settings saved", "Your changes are live.");
      } else {
        error("Failed to save settings", data.error);
        showSaveNotice("error", "Failed to save settings", data.error);
      }
    } catch {
      error("Failed to save settings", "Please try again later");
      showSaveNotice(
        "error",
        "Failed to save settings",
        "Please try again later",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkChange = (
    index: number,
    field: "url" | "label",
    value: string,
    locale?: string,
  ) => {
    setSettings((prev) => {
      const nextLinks = [...prev.menuLinks];
      const current = nextLinks[index] || createLink(languageCodes);
      if (field === "label" && locale) {
        current.label = {
          ...current.label,
          [locale]: value,
        };
      } else if (field === "url") {
        current.url = value;
      }
      nextLinks[index] = { ...current };
      return { ...prev, menuLinks: nextLinks };
    });
  };

  const addMenuLink = () =>
    setSettings((prev) => ({
      ...prev,
      menuLinks: [...prev.menuLinks, createLink(languageCodes)],
    }));

  const removeMenuLink = (index: number) =>
    setSettings((prev) => ({
      ...prev,
      menuLinks: prev.menuLinks.filter((_, idx) => idx !== index),
    }));

  const toggleSupportedLocale = (code: string) => {
    setSettings((prev) => {
      const supported = new Set(prev.localization.supportedLocales);
      if (supported.has(code)) {
        if (prev.localization.defaultLocale === code) {
          return prev;
        }
        supported.delete(code);
      } else {
        supported.add(code);
      }
      return {
        ...prev,
        localization: {
          ...prev.localization,
          supportedLocales: Array.from(supported),
        },
      };
    });
  };

  const triggerOgImagePicker = () => {
    ogImageInputRef.current?.click();
  };

  const uploadOgImage = async (file: File) => {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("entity", "settings");
    payload.append("entitySlug", "seo");
    payload.append("field", "og-image");

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: payload,
    });
    const data = await response.json();

    if (data.success && data.data?.url) {
      return data.data.url as string;
    }
    throw new Error(data.error?.message || data.error || "Upload failed");
  };

  const handleOgImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Invalid file", "Please upload an image file");
      event.target.value = "";
      return;
    }

    setIsOgUploading(true);
    try {
      const url = await uploadOgImage(file);
      setSettings((prev) => ({
        ...prev,
        seo: { ...prev.seo, ogImageUrl: url },
      }));
      success("Image uploaded", "Open Graph image updated");
    } catch {
      error("Upload failed", "Please try again");
    } finally {
      setIsOgUploading(false);
      event.target.value = "";
    }
  };

  const handleOgImageRemove = () => {
    setSettings((prev) => ({
      ...prev,
      seo: { ...prev.seo, ogImageUrl: "" },
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your application settings" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application settings"
        actions={
          <Button type="submit" form="settings-form" disabled={isSaving}>
            Save Changes
          </Button>
        }
      />

      {saveNotice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            saveNotice.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
          role={saveNotice.type === "success" ? "status" : "alert"}
          aria-live={saveNotice.type === "success" ? "polite" : "assertive"}
        >
          <p className="font-medium">{saveNotice.title}</p>
          {saveNotice.description && (
            <p className="mt-1 opacity-80">{saveNotice.description}</p>
          )}
        </div>
      )}

      <FormLayout onSubmit={handleSubmit} className="max-w-6xl" id="settings-form">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-tabs">
          <div className="admin-tabs-header">
            <div className="admin-tabs-meta">
              <div className="admin-tabs-label">Settings</div>
              <TabsList className="admin-tabs-list">
                <TabsTrigger value="general" className="admin-tabs-trigger">
                  General
                </TabsTrigger>
                <TabsTrigger value="localization" className="admin-tabs-trigger">
                  Localization
                </TabsTrigger>
                <TabsTrigger value="api" className="admin-tabs-trigger">
                  API
                </TabsTrigger>
                <TabsTrigger value="seo" className="admin-tabs-trigger">
                  SEO
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="general" className="admin-tabs-body">
            <FormSection title="Site Identity">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField key={`site-name-${code}`} label={`Site Name (${code.toUpperCase()})`}>
                    <Input
                      value={settings.site.name?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized("site", "name", code, e.target.value)
                      }
                      placeholder="Aztehsil TV"
                    />
                  </FormField>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField
                    key={`site-description-${code}`}
                    label={`Site Description (${code.toUpperCase()})`}
                  >
                    <Textarea
                      rows={3}
                      value={settings.site.description?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized("site", "description", code, e.target.value)
                      }
                      placeholder="Short site description"
                    />
                  </FormField>
                ))}
              </div>
              <FormField label="Site URL">
                <Input
                  value={settings.site.url}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      site: { ...prev.site, url: e.target.value },
                    }))
                  }
                  placeholder="https://tehsiltv.az"
                />
              </FormField>
            </FormSection>

            <FormSection title="Header & Footer Links">
              <div className="admin-settings-links">
                {settings.menuLinks.map((link, index) => (
                  <div key={link.id} className="admin-settings-link-card">
                    <div className="admin-settings-link-header">
                      <span className="font-semibold">Link {index + 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMenuLink(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {languageCodes.map((code) => (
                        <FormField
                          key={`${link.id}-${code}`}
                          label={`Label (${code.toUpperCase()})`}
                        >
                          <Input
                            value={link.label?.[code] ?? ""}
                            onChange={(e) =>
                              handleLinkChange(index, "label", e.target.value, code)
                            }
                            placeholder="Menu title"
                          />
                        </FormField>
                      ))}
                    </div>
                    <FormField label="URL">
                      <Input
                        value={link.url ?? ""}
                        onChange={(e) =>
                          handleLinkChange(index, "url", e.target.value)
                        }
                        placeholder="/about"
                      />
                    </FormField>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addMenuLink}>
                Add Link
              </Button>
            </FormSection>

            <FormSection title="Contact">
              <FormField label="Contact Email">
                <Input
                  value={settings.contact.email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }))
                  }
                  placeholder="info@tehsiltv.az"
                />
              </FormField>
              <FormField label="Contact Phone">
                <Input
                  value={settings.contact.phone}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value },
                    }))
                  }
                  placeholder="+994..."
                />
              </FormField>
              <FormField label="Contact Address">
                <Textarea
                  rows={3}
                  value={settings.contact.address}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value },
                    }))
                  }
                  placeholder="Address"
                />
              </FormField>
            </FormSection>

            <FormSection title="Social Media">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Facebook">
                  <Input
                    value={settings.social.facebook || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social: { ...prev.social, facebook: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField label="Instagram">
                  <Input
                    value={settings.social.instagram || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social: { ...prev.social, instagram: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField label="YouTube">
                  <Input
                    value={settings.social.youtube || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social: { ...prev.social, youtube: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField label="Telegram">
                  <Input
                    value={settings.social.telegram || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social: { ...prev.social, telegram: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField label="TikTok">
                  <Input
                    value={settings.social.tiktok || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social: { ...prev.social, tiktok: e.target.value },
                      }))
                    }
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Footer">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField
                    key={`footer-copy-${code}`}
                    label={`Copyright (${code.toUpperCase()})`}
                  >
                    <Textarea
                      rows={2}
                      value={settings.footer.copyright?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized("footer", "copyright", code, e.target.value)
                      }
                      placeholder="© 2026 AztehsilTV.az"
                    />
                  </FormField>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Powered By Label">
                  <Input
                    value={settings.footer.poweredByLabel || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, poweredByLabel: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField label="Powered By URL">
                  <Input
                    value={settings.footer.poweredByUrl || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, poweredByUrl: e.target.value },
                      }))
                    }
                  />
                </FormField>
              </div>
            </FormSection>
          </TabsContent>

          <TabsContent value="seo" className="admin-tabs-body">
            <FormSection title="Default Meta">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField
                    key={`seo-title-${code}`}
                    label={`Default Meta Title (${code.toUpperCase()})`}
                  >
                    <Input
                      value={settings.seo.defaultTitle?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized("seo", "defaultTitle", code, e.target.value)
                      }
                      placeholder="Site title"
                    />
                  </FormField>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField
                    key={`seo-description-${code}`}
                    label={`Default Meta Description (${code.toUpperCase()})`}
                  >
                    <Textarea
                      rows={3}
                      value={settings.seo.defaultDescription?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized("seo", "defaultDescription", code, e.target.value)
                      }
                      placeholder="Meta description"
                    />
                  </FormField>
                ))}
              </div>
            </FormSection>

            <FormSection title="Open Graph">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField
                    key={`seo-og-title-${code}`}
                    label={`OG Title (${code.toUpperCase()})`}
                    hint="Sosial şəbəkələrdə paylaşılan başlıq"
                  >
                    <Input
                      value={settings.seo.ogTitle?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized("seo", "ogTitle", code, e.target.value)
                      }
                      placeholder="Open Graph title"
                    />
                  </FormField>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <FormField
                    key={`seo-og-description-${code}`}
                    label={`OG Description (${code.toUpperCase()})`}
                    hint="Sosial paylaşımlar üçün təsvir"
                  >
                    <Textarea
                      rows={3}
                      value={settings.seo.ogDescription?.[code] ?? ""}
                      onChange={(e) =>
                        updateLocalized(
                          "seo",
                          "ogDescription",
                          code,
                          e.target.value,
                        )
                      }
                      placeholder="Open Graph description"
                    />
                  </FormField>
                ))}
              </div>
              <FormField label="OG Image" hint="Sosial paylaşımlar üçün şəkil">
                <div className="admin-icon-field admin-cover-field">
                  <div className="admin-icon-preview admin-cover-preview">
                    {settings.seo.ogImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.seo.ogImageUrl}
                        alt="Open Graph"
                      />
                    ) : (
                      <span className="admin-icon-placeholder">No image</span>
                    )}
                  </div>
                  <div className="admin-icon-actions">
                    <input
                      ref={ogImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleOgImageUpload}
                      className="hidden"
                      disabled={isOgUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={triggerOgImagePicker}
                      disabled={isOgUploading}
                    >
                      {isOgUploading
                        ? "Uploading..."
                        : settings.seo.ogImageUrl
                          ? "Change Image"
                          : "Upload Image"}
                    </Button>
                    {settings.seo.ogImageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="admin-icon-remove"
                        onClick={handleOgImageRemove}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </FormField>
            </FormSection>

            <FormSection title="Analytics">
              <FormField label="Google Analytics ID">
                <Input
                  value={settings.analytics.gaId || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      analytics: { ...prev.analytics, gaId: e.target.value },
                    }))
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </FormField>
              <FormField label="Google Tag Manager ID">
                <Input
                  value={settings.analytics.gtmId || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      analytics: { ...prev.analytics, gtmId: e.target.value },
                    }))
                  }
                  placeholder="GTM-XXXXXXX"
                />
              </FormField>
            </FormSection>
          </TabsContent>

          <TabsContent value="api" className="admin-tabs-body">
            <FormSection title="API Settings">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Caching</p>
                  <p className="text-sm text-muted-foreground">
                    Cache API responses to improve performance
                  </p>
                </div>
                <Switch
                  checked={Boolean(settings.api.cacheEnabled)}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      api: { ...prev.api, cacheEnabled: checked },
                    }))
                  }
                />
              </div>
              <FormField label="Cache Timeout (seconds)">
                <Input
                  type="number"
                  value={settings.api.cacheTtl ?? 300}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      api: { ...prev.api, cacheTtl: Number(e.target.value) },
                    }))
                  }
                />
              </FormField>
              <FormField label="Rate Limit (requests per minute)">
                <Input
                  type="number"
                  value={settings.api.rateLimitPerMinute ?? 100}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      api: {
                        ...prev.api,
                        rateLimitPerMinute: Number(e.target.value),
                      },
                    }))
                  }
                />
              </FormField>
            </FormSection>
          </TabsContent>

          <TabsContent value="localization" className="admin-tabs-body">
            <FormSection title="Language Settings">
              <FormField label="Default Locale">
                <select
                  className="admin-select"
                  value={settings.localization.defaultLocale}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      localization: {
                        ...prev.localization,
                        defaultLocale: e.target.value,
                      },
                    }))
                  }
                >
                  {languageCodes.map((code) => (
                    <option key={code} value={code}>
                      {code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {languageCodes.map((code) => (
                  <div key={`locale-${code}`} className="admin-settings-locale">
                    <div>
                      <p className="font-medium">{code.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{code}</p>
                    </div>
                    <Switch
                      checked={settings.localization.supportedLocales.includes(code)}
                      onCheckedChange={() => toggleSupportedLocale(code)}
                      disabled={settings.localization.defaultLocale === code}
                    />
                  </div>
                ))}
              </div>
            </FormSection>

            <FormSection title="Regional Settings">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Timezone">
                  <Input
                    value={settings.localization.timezone || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        localization: {
                          ...prev.localization,
                          timezone: e.target.value,
                        },
                      }))
                    }
                  />
                </FormField>
                <FormField label="Date Format">
                  <Input
                    value={settings.localization.dateFormat || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        localization: {
                          ...prev.localization,
                          dateFormat: e.target.value,
                        },
                      }))
                    }
                  />
                </FormField>
                <FormField label="Time Format">
                  <Input
                    value={settings.localization.timeFormat || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        localization: {
                          ...prev.localization,
                          timeFormat: e.target.value,
                        },
                      }))
                    }
                  />
                </FormField>
              </div>
            </FormSection>
          </TabsContent>
        </Tabs>
      </FormLayout>
    </div>
  );
}
