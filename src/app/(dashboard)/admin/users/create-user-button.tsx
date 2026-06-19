"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CreateUserModal } from "./create-user-modal";

export function CreateUserButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleCreated(_name: string, _role: string) {
    // The server action already calls revalidatePath; trigger a client refresh too
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: "#7C3AED" }}
      >
        <UserPlus size={15} />
        Create account
      </button>

      {open && (
        <CreateUserModal
          onClose={() => setOpen(false)}
          onCreated={(name, role) => {
            handleCreated(name, role);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
