import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, settingsService } from "@/modules/settings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveFile } from "@/supabase/actions/save-file";
import { AvatarCropper } from "@/components/ui/avatar-cropper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building } from "lucide-react";

export type OrganizationSettings = {
  logo?: string;
  logo_horizontal?: string;
  primaryColor: string;
  name: string;
  logo_setting: string;
};

export function OrganizationSettings({ settings }: { settings?: Settings }) {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHorizontal, setIsUploadingHorizontal] = useState(false);

  // Always initialize these hooks, even if settings is undefined
  const [settingOrganization, setSettingOrganization] = useState<
    Settings | undefined
  >(settings);
  const [organizationSettings, setOrganizationSettings] =
    useState<OrganizationSettings>({
      logo: settings?.logo_url,
      logo_horizontal: settings?.logo_horizontal_url,
      primaryColor: settings?.primary_color || "#3b82f6",
      name: settings?.site_name || "My Organization",
      logo_setting: settings?.logo_setting || "square",
    });

  // If settings is undefined, return null after hook initialization
  if (!settings) {
    return null;
  }

  const submitSettings = async (data: any) => {
    setLoading(true);
    const payload = {
      site_name: data.name,
      logo_url: data.logo,
      logo_horizontal_url: data.logo_horizontal,
      primary_color: data.primaryColor,
      logo_setting: data.logo_setting,
      favicon_url: data.logo,
    };
    const settings = await settingsService.updateSettingsById(payload);
    setSettingOrganization(settings);
    toast.success("Settings updated successfully");
    window.dispatchEvent(new CustomEvent("settings-update"));
    setLoading(false);
  };

  // Handle image change from AvatarCropper
  const handleLogoChange = async (file: File | null) => {
    setIsUploading(true);
    try {
      if (file) {
        const fileUrl = await saveFile(file);
        setOrganizationSettings((prev) => ({
          ...prev,
          logo: fileUrl || undefined,
        }));
      } else {
        // If file is null, remove the logo
        setOrganizationSettings((prev) => ({
          ...prev,
          logo: undefined,
        }));
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleHorizontalLogoChange = async (file: File | null) => {
    setIsUploadingHorizontal(true);
    try {
      if (file) {
        const fileUrl = await saveFile(file);
        setOrganizationSettings((prev) => ({
          ...prev,
          logo_horizontal: fileUrl || undefined,
        }));
      } else {
        // If file is null, remove the logo
        setOrganizationSettings((prev) => ({
          ...prev,
          logo_horizontal: undefined,
        }));
      }
    } catch (error) {
      console.error("Error uploading horizontal logo:", error);
      toast.error("Failed to upload horizontal logo");
    } finally {
      setIsUploadingHorizontal(false);
    }
  };

  return (
    <Card className="w-full flex-1">
      <CardHeader>
        <CardTitle className="text-2xl">Organization Settings</CardTitle>
        <CardDescription>
          Customize your organization's branding and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization Information */}
        <div className="rounded-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Enter organization name"
              value={organizationSettings.name}
              onChange={(e) =>
                setOrganizationSettings((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Organization Square Logo (Icon) */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base font-medium">Square Logo (Icon)</Label>
            <p className="text-sm text-muted-foreground">
              Upload a square icon logo for square spaces, favicons, and app
              icons
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <AvatarCropper
              profileImage={organizationSettings.logo}
              onImageChange={handleLogoChange}
              isUploading={isUploading}
              size="lg"
              shape="square"
            />
            <span className="text-sm text-muted-foreground">
              {isUploading
                ? "Uploading..."
                : "Click or drag to upload square logo"}
            </span>
          </div>
        </div>

        {/* Organization Horizontal Logo (Full Brand) */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              Horizontal Logo (Full Brand)
            </Label>
            <p className="text-sm text-muted-foreground">
              Upload a horizontal logo with your brand name for headers and wide
              spaces
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <AvatarCropper
              profileImage={organizationSettings.logo_horizontal}
              onImageChange={handleHorizontalLogoChange}
              isUploading={isUploadingHorizontal}
              size="lg"
              shape="horizontal"
              aspectRatio={4 / 1}
            />
            <span className="text-sm text-muted-foreground">
              {isUploadingHorizontal
                ? "Uploading..."
                : "Click or drag to upload horizontal logo"}
            </span>
          </div>
        </div>

        {/* Logo Display Style */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base font-medium">Logo Display Style</Label>
            <p className="text-sm text-muted-foreground">
              Choose which logo to display in the sidebar
            </p>
          </div>
          <RadioGroup
            value={organizationSettings.logo_setting}
            onValueChange={(value) =>
              setOrganizationSettings((prev) => ({
                ...prev,
                logo_setting: value,
              }))
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="square" id="square-logo-display" />
              <Label
                htmlFor="square-logo-display"
                className="text-sm font-normal cursor-pointer"
              >
                Square
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="horizontal" id="horizontal-logo-display" />
              <Label
                htmlFor="horizontal-logo-display"
                className="text-sm font-normal cursor-pointer"
              >
                Horizontal
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            disabled={loading}
            onClick={() => submitSettings(organizationSettings)}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
