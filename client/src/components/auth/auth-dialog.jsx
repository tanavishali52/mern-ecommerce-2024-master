import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthLogin from "@/pages/auth/login";
import AuthRegister from "@/pages/auth/register";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function AuthDialog({
  triggerButton,
  defaultTab = "login",
  isOpen,
  onOpenChange
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Use controlled open state if provided, otherwise use internal state
  const isDialogOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleClose = (success) => {
    if (success) {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] p-0">
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
        </VisuallyHidden>
        <DialogDescription className="sr-only">
          Sign in or create an account to access your profile and make purchases
        </DialogDescription>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full rounded-none rounded-t-lg grid grid-cols-2">
            <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
          </TabsList>
          <div className="p-6">
            <TabsContent value="login" className="mt-0">
              <AuthLogin isDialog setOpen={handleClose} />
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <AuthRegister isDialog setOpen={handleClose} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}