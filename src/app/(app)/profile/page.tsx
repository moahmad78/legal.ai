"use client";

import { useState } from "react";
import {  useUser  } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // In a real app, this would call a Supabase endpoint to update the extended profile fields
    // and clerk API to update name/photo.
    setTimeout(() => {
      toast.success("Profile updated successfully");
      setIsLoading(false);
    }, 1000);
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal identity and professional details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
                <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm">Profile Photo</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Recommended size: 256x256px.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" type="button">Upload New</Button>
                <Button size="sm" variant="ghost" type="button" className="text-destructive">Remove</Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user.fullName || ""} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input defaultValue={user.primaryEmailAddress?.emailAddress} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input defaultValue="+91 " placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input placeholder="Managing Partner, Senior Counsel..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Professional Bio</Label>
            <Textarea placeholder="Briefly describe your expertise..." className="h-24" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Configure your regional settings and language.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select defaultValue="Asia/Kolkata">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Primary Language</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
