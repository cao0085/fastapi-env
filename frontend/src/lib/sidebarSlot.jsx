import { createContext, useContext, useState } from 'react'

const Ctx = createContext({ slot: null, setSlot: () => {} })

export function SidebarSlotProvider({ children }) {
  const [slot, setSlot] = useState(null)
  return <Ctx.Provider value={{ slot, setSlot }}>{children}</Ctx.Provider>
}

export const useSidebarSlot = () => useContext(Ctx)
