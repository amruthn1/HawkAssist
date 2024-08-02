"use client"

import { signOut, useSession } from "next-auth/react"

export default function Settings() {

    const { data: session } = useSession()

    if (session) {
        return (
            <div className="flex justify-center items-center">
                <div className="flex flex-row items-center justify-center">
                    <img src={session.user?.image ? session.user?.image : "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"} className="size-10 rounded-2xl ml-2 mr-2" alt="User Image" />
                    {session.user?.name}
                    <button className="btn btn-outline dark:btn-primary ml-8 mr-2" onClick={() => signOut()}>Sign Out</button>
                </div>
            </div>
        )
    }
}