"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">ImageKit Demo</div>
        <div className="flex items-center gap-3">
          {status === "authenticated" && (
            <>
              {user?.image && (
                <Image
                  src={user.image}
                  alt={user.name || user.email || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="text-sm text-gray-700">
                {user?.name || user?.email}
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          )}
          {status !== "authenticated" && (
            <div className="text-sm text-gray-500">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  );
}
