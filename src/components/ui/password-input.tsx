"use client"

import { forwardRef, useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
	({ className, ...props }, ref) => {
		const disabled = props.value === "" || props.value === undefined || props.disabled

		return (
			<Input
				className={cn("hide-password-toggle pr-10", className)}
				ref={ref}
				{...props}
			/>

		)
	},
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }