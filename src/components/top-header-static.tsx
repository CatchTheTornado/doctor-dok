'use client'
import { Button } from "./ui/button";
import { SettingsPopup } from "@/components/settings-popup";
import FolderListPopup from "./folder-list-popup";
import RecordForm from "./record-form";
import { FolderContext } from "@/contexts/folder-context";
import { useContext, useEffect, useState } from "react";
import { Chat } from "./chat";
import { Edit3Icon, FoldersIcon, KeyIcon, LogOutIcon, MenuIcon, MenuSquareIcon, MessageCircleIcon, PlusIcon, Settings2Icon, SettingsIcon, Share2Icon, UsersIcon } from "lucide-react";
import { DatabaseContext } from "@/contexts/db-context";
import { toast } from "sonner";
import { useTheme } from 'next-themes';
import SharedKeysPopup from "./shared-keys-popup";
import { ChangeKeyPopup } from "./change-key-popup";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import StatsPopup from "./stats-popup";
import Link from 'next/link';

export default function TopHeaderStatic() {

    const { theme, systemTheme } = useTheme();
    const currentTheme = (theme === 'system' ? systemTheme : theme)
    
    return (
      <div className="sticky top-0 z-1000 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-200 dark:bg-zinc-800 h-12">
        <div className="font-medium flex justify-center items-center">
          <div><img className="h-14 w-14" src={currentTheme === 'dark' ? `/img/doctor-dok-logo-white.svg` : `/img/doctor-dok-logo.svg`} /></div>
          <div className="">Doctor Dok <Link href="/" className="ml-3 underline hover:text-blue-500" >Go back to app</Link></div>
        </div>
        <div className="flex items-center gap-2">


            
        </div>
      </div>
    );
}

function LogInIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" x2="3" y1="12" y2="12" />
      </svg>
    )
  }