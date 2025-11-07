"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getInitials } from "@/lib/utils/format"
import { getUserAvatarColor } from "@/lib/utils/colors"

export type UserAvatarProps = {
  user?: { name?: string | null; avatar_url?: string | null; email?: string | null }
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  onClick?: () => void
  className?: string
}

const sizeMap = { xs: 20, sm: 28, md: 36, lg: 44, xl: 64 }

export function UserAvatar({ user, size = "md", onClick, className = "" }: UserAvatarProps) {
  const px = sizeMap[size]
  const name = user?.name || user?.email || "?"
  const initials = getInitials(name)
  const bg = getUserAvatarColor(name)

  const avatar = (
    <Avatar className={`overflow-hidden ${className}`} style={{ width: px, height: px }}>
      {user?.avatar_url ? (
        <AvatarImage src={user.avatar_url} alt={name} />
      ) : (
        <AvatarFallback className="font-medium" style={{ backgroundColor: bg, color: "#fff" }}>{initials}</AvatarFallback>
      )}
    </Avatar>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onClick} aria-label={name} className="rounded-full">
            {avatar}
          </button>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
