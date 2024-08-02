"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { databaseIdValidator, userKeyValidator } from "@/data/client/models";
import { Checkbox } from "./ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { PasswordInput } from "./ui/password-input";

interface AuthorizeDatabaseFormProps {
}

export function AuthorizeDatabaseForm({
}: AuthorizeDatabaseFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(localStorage.getItem("keepLoggedIn") === "true")

  const handleAuthorizeDatabase = handleSubmit((data) => {
    // Handle form submission
  });

  return (
    <form onSubmit={handleAuthorizeDatabase}>
      <div className="flex flex-col space-y-2 gap-2 mb-4">
        <Label htmlFor="databaseId">Database ID</Label>
        <Input
          type="text"
          id="databaseId"
          {...register("databaseId", { required: true,
            validate: {
              databaseId: databaseIdValidator
            }                    
           })}
        />
        {errors.databaseId && <span className="text-red-500 text-sm">Database Id must be at least 6 letters and/or digits and unique</span>}
      </div>
      <div className="flex flex-col space-y-2 gap-2 mb-4">
        <Label htmlFor="key">Key</Label>
            <div className="relative">
            <PasswordInput autoComplete="new-password" id="password"
                type={showPassword ? 'text' : 'password'}
                {...register("key", { required: true,
                    validate: {
                        key: userKeyValidator
                    }            
                    })}                        />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent z-0"
                    onClick={() => setShowPassword((prev) => !prev)}
                >
                    {showPassword ? (
                    <EyeIcon
                        className="h-4 w-4"
                        aria-hidden="true"
                    />
                    ) : (
                    <EyeOffIcon
                        className="h-4 w-4"
                        aria-hidden="true"
                    />
                    )}
                    <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                    </span>
                </Button>

                {/* hides browsers password toggles */}
                <style>{`
                    .hide-password-toggle::-ms-reveal,
                    .hide-password-toggle::-ms-clear {
                    visibility: hidden;
                    pointer-events: none;
                    display: none;
                    }
                `}</style>
                </div>
        {errors.key && <span className="text-red-500 text-sm">Key must be at least 8 characters length including digits, alpha, lower and upper letters.</span>}
        </div>
        <div className="flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
                <Checkbox
                    id="keepLoggedIn"
                    checked={keepLoggedIn}
                    onCheckedChange={(checked) => {
                    setKeepLoggedIn(checked);
                    localStorage.setItem("keepLoggedIn", checked.toString());
                        }}
                />
                <label htmlFor="keepLoggedIn" className="text-sm">Keep me logged in</label>
            </div>      
            <div className="items-center flex justify-center">
                <Button type="submit">Create database</Button>
            </div>
        </div>
    </form>
  );
}