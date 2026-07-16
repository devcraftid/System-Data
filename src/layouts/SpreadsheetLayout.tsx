import React from "react"
import { Outlet } from "react-router-dom"

export function SpreadsheetLayout() {
  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-hidden">
      <Outlet />
    </div>
  )
}
