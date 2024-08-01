"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { databaseIdValidator, userKeyValidator } from "@/data/client/models";

interface AuthorizeDatabaseFormProps {
}

export function AuthorizeDatabaseForm({
}: AuthorizeDatabaseFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();

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
        <Input
          type="password"
          id="key"
          {...register("key", { required: true,
            validate: {
              key: userKeyValidator
            }        
           })}
        />
        {errors.key && <span className="text-red-500 text-sm">Key must be at least 8 characters length including digits, alpha, lower and upper letters.</span>}
        </div>
      <div className="items-center flex justify-center">
        <Button type="submit">Open database</Button>
      </div>
    </form>
  );
}