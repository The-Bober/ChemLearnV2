
"use client";

import type { ChangeEvent} from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

// Firebase imports - for full implementation
// import { storage, db, auth } from "@/lib/firebase";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { updateProfile } from "firebase/auth";
// import { doc, updateDoc } from "firebase/firestore";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshCompletedQuizzesCount } = useAuth(); // Assuming refresh is available or add a dedicated user refresh
  const { toast } = useToast();
  const { t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.photoURL) {
      setPreviewUrl(user.photoURL);
    }
  }, [user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: t('profile.noFileSelected'),
        description: t('profile.noFileSelectedDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    toast({ title: t('profile.uploading'), description: t('profile.uploadingDescription') });

    // TODO: Implement actual Firebase Storage upload and profile update
    // This is a placeholder for the actual upload logic.
    try {
      // 1. Upload to Firebase Storage
      // const filePath = `profile-images/${user.uid}/${selectedFile.name}`;
      // const storageRef = ref(storage, filePath);
      // await uploadBytes(storageRef, selectedFile);
      // const downloadURL = await getDownloadURL(storageRef);

      // For now, simulate a successful upload and use the local preview URL or a placeholder
      const downloadURL = previewUrl; // In a real scenario, this would be from Firebase Storage

      // 2. Update Firebase Auth profile
      // if (auth.currentUser) {
      //   await updateProfile(auth.currentUser, { photoURL: downloadURL });
      // }

      // 3. Update Firestore user document (if you store photoURL there too)
      // const userDocRef = doc(db, "users", user.uid);
      // await updateDoc(userDocRef, { photoURL: downloadURL });

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));


      toast({
        title: t('profile.uploadSuccess'),
        description: t('profile.uploadSuccessDescription'),
      });
      // Refresh user state if necessary, AuthContext might need a manual refresh function
      // Or rely on onAuthStateChanged to eventually pick up the change.
      // For immediate UI update if not using a global state for user object that includes photoURL:
      // if (user) user.photoURL = downloadURL; // This would be bad practice, better to refresh context
      // refreshUserData(); // This function would need to be exposed from AuthContext
      
      // For this prototype, we will rely on the user seeing the preview change.
      // A full implementation would ensure the user object in AuthContext is updated.

    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: t('profile.uploadFailed'),
        description: error instanceof Error ? error.message : t('profile.uploadFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /> {t('profile.loadingUser')}</div>;
  }

  if (!user) {
    // This should ideally be handled by the layout, but as a fallback:
    return <div className="p-4">{t('profile.pleaseLogin')}</div>;
  }

  const userName = user.displayName || user.email?.split('@')[0] || "User";
  const userEmail = user.email || "No email provided";

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('profile.infoCardTitle')}</CardTitle>
          <CardDescription>{t('profile.infoCardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2">
              <AvatarImage src={previewUrl || user.photoURL || `https://placehold.co/100x100.png`} alt={userName} data-ai-hint="user avatar large" />
              <AvatarFallback className="text-3xl">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">{userName}</h2>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-picture">{t('profile.changePictureLabel')}</Label>
            <div className="flex items-center gap-4">
                <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-grow"
                    disabled={isUploading}
                />
                <Button onClick={handleImageUpload} disabled={isUploading || !selectedFile}>
                    {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? t('profile.uploadingButton') : t('profile.uploadButton')}
                </Button>
            </div>
            {previewUrl && selectedFile && (
              <div className="mt-4 p-2 border rounded-md max-w-xs">
                <p className="text-sm text-muted-foreground mb-2">{t('profile.imagePreview')}</p>
                <Image src={previewUrl} alt="Preview" width={100} height={100} className="rounded-md object-cover" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t('profile.firebaseTodo')}
            </p>
          </div>
          
          {/* Placeholder for other profile fields */}
          {/* 
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" defaultValue={userName} disabled />
          </div>
          <Button disabled>Save Changes (Not Implemented)</Button> 
          */}
        </CardContent>
      </Card>
    </div>
  );
}
