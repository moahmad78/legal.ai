"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calculator, Calendar, CreditCard, Settings, User, Smile, Briefcase, FileText, MessageSquare, Cpu } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search chats, clients, matters, documents..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Chats">
            <CommandItem onSelect={() => runCommand(() => router.push("/app/chat"))}>
              <Cpu className="mr-2 h-4 w-4 text-primary" />
              <span>Ask Catalyst AI</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/app/chat"))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Tax Notice 2025</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Clients">
            <CommandItem onSelect={() => runCommand(() => router.push("/clients"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Alpha Ventures</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/clients"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Beta Retail</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Matters">
            <CommandItem onSelect={() => runCommand(() => router.push("/matters"))}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Acquisition of TechCorp</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/billing"))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
